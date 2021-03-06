'use strict'

import * as log4js from 'log4js'
import { DateTime } from 'luxon'
import { AssetHolderService } from '.'
import {
    PortfolioRepository,
    AssetRepository,
    AssetHolderRepository,
    TransactionRepository,
    TPurchase,
    TTransactionNew,
    TTransfer,
    Transaction,
    ValidationError,
    InsufficientBalance,
    InvalidTransaction,
    ConflictError,
    TransactionLeg,
    generateId,
} from '..'

const logger = log4js.getLogger('TransactionService')

type CommitState = {
    id: string
    transactionId: string
    portfolioId: string
    assetId: string
    units: number
    value: number
    timestamp: string
    xids?: any
}

export class TransactionService {
    private portfolioRepository: PortfolioRepository
    private assetRepository: AssetRepository
    private assetHolderRepository: AssetHolderRepository
    private transactionRepository: TransactionRepository
    private assetHolderService: AssetHolderService

    constructor(
        assetRepository: AssetRepository,
        portfolioRepository: PortfolioRepository,
        transactionRepository: TransactionRepository,
    ) {
        this.portfolioRepository = portfolioRepository
        this.assetRepository = assetRepository
        this.assetHolderRepository = new AssetHolderRepository()
        this.transactionRepository = transactionRepository
        this.assetHolderService = new AssetHolderService(this.assetRepository)
    }

    /////////////////////////////
    // Public Methods
    /////////////////////////////

    async executePurchaseAsync(exchangeData: TPurchase) {
        //logger.trace(`executePurchase: ${JSON.stringify(exchangeData)}`)
        logger.trace(`executePurchase`, exchangeData)
        // takes simple structure and fills out the rest:
        // eg:
        // const data: TPurchase = {
        //     buyerPorfolioId: leaguePortfolioId,
        //     sellerPortfolioId: portfolioId,
        //     assetId: assetId,
        //     units: units,
        // }
        const coinAssetId = 'coin::rkt'

        const transaction: TTransactionNew = {
            inputs: [
                {
                    // units in from user portfolio
                    portfolioId: exchangeData.sellerPortfolioId,
                    assetId: exchangeData.assetId,
                    units: exchangeData.units * -1,
                    refValue: exchangeData.coins,
                },
                {
                    // coins in from asset portfolio
                    portfolioId: exchangeData.buyerPorfolioId,
                    assetId: coinAssetId,
                    units: exchangeData.coins * -1,
                    refValue: exchangeData.coins * -1,
                },
            ],
            outputs: [
                {
                    // shares out to league asset
                    portfolioId: exchangeData.buyerPorfolioId,
                    assetId: exchangeData.assetId,
                    units: exchangeData.units,
                    refValue: exchangeData.coins,
                },
                {
                    // coins out to user portfolio
                    portfolioId: exchangeData.sellerPortfolioId,
                    assetId: coinAssetId,
                    units: exchangeData.coins,
                    refValue: exchangeData.coins,
                },
            ],
        }
        if (exchangeData.tags) {
            transaction.tags = exchangeData.tags
        }

        return this.executeTransactionAsync(transaction)
    }

    // a transfer is a transaction with one input, out output, and one asset
    async executeTransferAsync(transferData: TTransfer) {
        // logger.trace(`executeTransfer: ${JSON.stringify(transferData)}`)
        logger.trace(`executeTransfer`, transferData)

        const inputPortfolioId = transferData.inputPortfolioId
        const outputPortfolioId = transferData.outputPortfolioId
        const assetId = transferData.assetId
        const units = transferData.units
        const value = transferData.value

        const transaction: TTransactionNew = {
            inputs: [
                {
                    portfolioId: inputPortfolioId,
                    assetId: assetId,
                    units: -1 * units,
                    refValue: -1 * value,
                },
            ],
            outputs: [
                {
                    portfolioId: outputPortfolioId,
                    assetId: assetId,
                    units: units,
                    refValue: value,
                },
            ],
        }
        if (transferData.tags) {
            transaction.tags = transferData.tags
        }

        return this.executeTransactionAsync(transaction)
    }

    async executeTransactionAsync(transactionData: TTransactionNew) {
        //logger.debug(`executeTransaction ${JSON.stringify(transactionData)}`)
        logger.trace(`executeTransactionAsync`, transactionData)

        const transaction = Transaction.newTransaction(transactionData)
        const transactionId = transaction.transactionId

        try {
            await this.transactionRepository.storeAsync(transaction)

            await this._validateLegsAsync(transaction)

            await this._verifyAssetsAsync(transaction)

            let commitStates: CommitState[] = []

            //////////////////////////
            // process input legs first (if they fail, less to clean up)
            if (transaction.inputs) {
                const inputLegs = transaction.inputs
                for (let i = 0; i < inputLegs.length; ++i) {
                    const inputLeg = inputLegs[i]
                    const commitState = this._processLeg(transactionId, inputLeg, transaction.xids)
                    commitStates.push(commitState)
                }
            }

            //////////////////////////
            // process output legs (very little to make them fail)
            if (transaction.outputs) {
                const outputLegs = transaction.outputs
                for (let i = 0; i < outputLegs.length; ++i) {
                    const outputLeg = outputLegs[i]
                    const commitState = this._processLeg(transactionId, outputLeg, transaction.xids)
                    commitStates.push(commitState)
                }
            }

            //////////////////////////
            // commit the batch
            {
                const updates = commitStates.map((commitState) => {
                    return {
                        portfolioId: commitState.portfolioId,
                        assetId: commitState.assetId,
                        deltaUnits: commitState.units,
                        deltaValue: commitState.value,
                    }
                })

                await this.assetHolderService.processTransaction(updates, transaction)
            }

            transaction.transactionStatus = 'success'
            await this.transactionRepository.updateAsync(transactionId, {
                transactionStatus: transaction.transactionStatus,
            })

            // if (this.eventPublisher) {
            //     await this.eventPublisher.publishTransactionEventCompleteAsync(transaction, 'transactionHandler')
            // }

            return commitStates
        } catch (error: any) {
            if (error instanceof ValidationError) {
                // nothing will have been done yet so nothing to roll back
                transaction.transactionStatus = 'failed'
                transaction.error = error.message
                await this.transactionRepository.updateAsync(transactionId, {
                    transactionStatus: transaction.transactionStatus,
                    error: transaction.error,
                })

                // if (this.eventPublisher) {
                //     await this.eventPublisher.publishTransactionEventErrorAsync(
                //         transaction,
                //         error.message,
                //         'transactionHandler',
                //     )
                // }

                throw error
            } else if (error instanceof InsufficientBalance) {
                // nothing will have been done yet so nothing to roll back
                transaction.transactionStatus = 'failed'
                transaction.error = error.message
                await this.transactionRepository.updateAsync(transactionId, {
                    transactionStatus: transaction.transactionStatus,
                    error: transaction.error,
                })

                // if (this.eventPublisher) {
                //     await this.eventPublisher.publishTransactionEventErrorAsync(
                //         transaction,
                //         error.message,
                //         'transactionHandler',
                //     )
                // }

                throw error
            } else if (error instanceof InvalidTransaction) {
                // (*)
                // nothing will have been done yet so nothing to roll back
                transaction.transactionStatus = 'failed'
                transaction.error = error.message
                await this.transactionRepository.updateAsync(transactionId, {
                    transactionStatus: transaction.transactionStatus,
                    error: transaction.error,
                })

                // if (this.eventPublisher) {
                //     await this.eventPublisher.publishTransactionEventErrorAsync(
                //         transaction,
                //         error.message,
                //         'transactionHandler',
                //     )
                // }

                throw error
            } else {
                transaction.transactionStatus = 'error'
                transaction.error = error.message
                await this.transactionRepository.updateAsync(transactionId, {
                    transactionStatus: transaction.transactionStatus,
                    error: transaction.error,
                })

                // if (this.eventPublisher) {
                //     await this.eventPublisher.publishTransactionEventErrorAsync(
                //         transaction,
                //         error.message,
                //         'transactionHandler',
                //         error.stack,
                //     )
                // }

                throw error // unknown error, rethrow it (**)
            }
        }
    }

    ////////////////////////////////////////////////////////
    // PRIVATE
    ////////////////////////////////////////////////////////

    private async _verifyAssetsAsync(transaction: Transaction) {
        //////////////////////////
        // process input legs first - want to fail if input is missing.

        //////////////////////////
        // validate input legs
        if (transaction.inputs) {
            const inputLegs = transaction.inputs
            for (let i = 0; i < inputLegs.length; ++i) {
                const inputLeg = inputLegs[i]
                const portfolioId = inputLeg.portfolioId
                const assetId = inputLeg.assetId
                const units = inputLeg.units

                const portfolioType = portfolioId.split(':')[0]
                const isBank = portfolioType === 'bank'
                const canShort = isBank

                // eslint-disable-next-line no-await-in-loop
                let holding = await this.assetHolderRepository.getDetailAsync(assetId, portfolioId)
                if (canShort) {
                    // if can short, create input holding if it doesn't already
                    // exist. new holding may end up with negative balance. (if cannot
                    // short and no holding, then will fail for insufficient balance)
                    if (!holding) {
                        // eslint-disable-next-line no-await-in-loop
                        holding = await this.assetHolderService.createAssetHolder(assetId, portfolioId)
                    }
                }

                if (!holding) {
                    // not a mint or bank, error if holding no exists
                    const msg = `No input holding - input: ${i + 1} portfolio: ${portfolioId} holding: ${assetId}`
                    throw new InsufficientBalance(msg, { payload: transaction })
                }

                if (!canShort) {
                    // if cannot short, verify balance is adequate to complete transaction
                    if (holding.units + units < 0) {
                        const msg = `Insufficient input balance - input: ${
                            i + 1
                        } portfolio: ${portfolioId} holding: ${assetId} units: ${units * -1}`
                        throw new InsufficientBalance(msg, { payload: transaction })
                    }
                }
            }
        }

        //////////////////////////
        // validate output legs
        if (transaction.outputs) {
            const outputLegs = transaction.outputs
            for (let i = 0; i < outputLegs.length; ++i) {
                const outputLeg = outputLegs[i]
                const portfolioId = outputLeg.portfolioId
                const assetId = outputLeg.assetId
                const assetType = assetId.split(':')[0]
                const isCoin = assetType === 'coin'

                // eslint-disable-next-line no-await-in-loop
                let holding = await this.assetHolderRepository.getDetailAsync(assetId, portfolioId)
                if (!holding) {
                    // eslint-disable-next-line no-await-in-loop
                    holding = await this.assetHolderService.createAssetHolder(assetId, portfolioId)
                }
            }
        }
    }

    // validate the legs. will throw if anything is wrong.
    private async _validateLegsAsync(transaction: Transaction) {
        //////////////////////////
        // validate input legs
        if (transaction.inputs) {
            const inputLegs = transaction.inputs
            for (let i = 0; i < inputLegs.length; ++i) {
                const inputLeg = inputLegs[i]
                const portfolioId = inputLeg.portfolioId
                const assetId = inputLeg.assetId
                const units = inputLeg.units

                if (units > 0) {
                    const msg = `Invalid units input: ${
                        i + 1
                    } portfolio: ${portfolioId} holding: ${assetId} units: ${units}`
                    throw new InvalidTransaction(msg)
                }

                // verify that asset exists.
                // eslint-disable-next-line no-await-in-loop
                const transactionAsset = await this.assetRepository.getDetailAsync(assetId)
                if (!transactionAsset) {
                    const msg = `Transaction Failed - input assetId not registered (${assetId})`
                    throw new ConflictError(msg, { payload: transaction })
                }

                // verify that portfolio exists.
                // eslint-disable-next-line no-await-in-loop
                const transactionPortfolio = await this.portfolioRepository.getDetailAsync(portfolioId)
                if (!transactionPortfolio) {
                    const msg = `Transaction Failed - input portfolioId not registered (${portfolioId})`
                    throw new ConflictError(msg, { payload: transaction })
                }
            }
        }

        //////////////////////////
        // validate output legs
        if (transaction.outputs) {
            const outputLegs = transaction.outputs
            for (let i = 0; i < outputLegs.length; ++i) {
                const outputLeg = outputLegs[i]
                const portfolioId = outputLeg.portfolioId
                const assetId = outputLeg.assetId
                const units = outputLeg.units

                // support 0 units to "create" an empty holding
                if (units < 0) {
                    const msg = `Invalid units output: ${
                        i + 1
                    } portfolio: ${portfolioId} holding: ${assetId} units: ${units}`
                    throw new InvalidTransaction(msg)
                }

                // verify that asset exists.
                // eslint-disable-next-line no-await-in-loop
                const transactionAsset = await this.assetRepository.getDetailAsync(assetId)
                if (!transactionAsset) {
                    const msg = `Transaction Failed - output assetId not registered (${assetId})`
                    throw new ConflictError(msg, { payload: transaction })
                }

                // verify that portfolio portfolio exists.
                // eslint-disable-next-line no-await-in-loop
                const transactionPortfolio = await this.portfolioRepository.getDetailAsync(portfolioId)
                if (!transactionPortfolio) {
                    const msg = `Transaction Failed - output portfolioId not registered (${portfolioId})`
                    throw new ConflictError(msg, { payload: transaction })
                }
            }
        }

        //////////////////////////
        // validate transactions - should balance all inputs and outputs per asset.
        const imbalance = this._verifyTransactionBalance(transaction)
        if (imbalance) {
            // eslint-disable-next-line no-await-in-loop
            const msg = `inputs/outputs not balanced (${imbalance})`
            throw new InvalidTransaction(msg)
        }
    }

    private _verifyTransactionBalance(transaction: Transaction) {
        const assetMap: any = {}
        if (transaction.inputs) {
            for (let i = 0; i < transaction.inputs.length; ++i) {
                const input = transaction.inputs[i]
                const assetId = input.assetId
                if (assetMap[assetId] === undefined) {
                    assetMap[assetId] = 0
                }
                assetMap[assetId] += input.units
            }
        }

        if (transaction.outputs) {
            for (let i = 0; i < transaction.outputs.length; ++i) {
                const output = transaction.outputs[i]
                const assetId = output.assetId
                if (assetMap[assetId] === undefined) {
                    assetMap[assetId] = 0
                }
                assetMap[assetId] += output.units
            }
        }

        for (const assetId in assetMap) {
            if (assetMap[assetId] !== 0) {
                return assetId
            }
        }
        return null
    }

    private _processLeg(transactionId: string, leg: TransactionLeg, transactionXids: any) {
        const timeAtNow = DateTime.utc().toString()
        const commitState: CommitState = {
            id: generateId(),
            transactionId: transactionId,
            portfolioId: leg.portfolioId,
            assetId: leg.assetId,
            units: leg.units,
            value: leg.refValue || 0,
            timestamp: timeAtNow,
        }

        if (transactionXids) commitState.xids = transactionXids

        return commitState
    }
}
