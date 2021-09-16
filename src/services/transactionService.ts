'use strict'

import { DateTime } from 'luxon'
import { IEventPublisher, PortfolioHoldingService, EventPublisher } from '.'
import {
    PortfolioRepository,
    AssetRepository,
    PortfolioHoldingRepository,
    TransactionRepository,
    TPurchase,
    TTransactionNew,
    TTransfer,
    Transaction,
    ValidationError,
    InsufficientBalance,
    InvalidTransaction,
    NotFoundError,
    TPortfolio,
    round4,
    ConflictError,
    TransactionLeg,
    generateId,
} from '..'

const logger = require('log4js').getLogger('transactionHandler')

export class TransactionService {
    private eventPublisher: IEventPublisher

    private portfolioRepository: PortfolioRepository
    private assetRepository: AssetRepository
    private portfolioHoldingRepository: PortfolioHoldingRepository
    private transactionRepository: TransactionRepository
    private portfolioHoldingService: PortfolioHoldingService

    constructor(eventPublisher?: IEventPublisher) {
        this.eventPublisher = eventPublisher || new EventPublisher({ logger: logger })
        this.portfolioRepository = new PortfolioRepository()
        this.assetRepository = new AssetRepository()
        this.portfolioHoldingRepository = new PortfolioHoldingRepository()
        this.transactionRepository = new TransactionRepository()
        this.portfolioHoldingService = new PortfolioHoldingService()
    }

    /////////////////////////////
    // Public Methods
    /////////////////////////////

    // EJH: used by league service buyLeagueAsset(), sellAssetToLeagueImpl()
    // takes simple structure and fills out the rest:
    // eg:
    // const data: TPurchase = {
    //     buyerPorfolioId: leaguePortfolioId,
    //     sellerPortfolioId: portfolioId,
    //     assetId: assetId,
    //     units: units,
    //     coins: cost,
    // }
    async executePurchaseAsync(exchangeData: TPurchase) {
        const coinAssetId = 'coin::rkt'

        const transaction: TTransactionNew = {
            inputs: [
                {
                    // units in from user portfolio
                    portfolioId: exchangeData.sellerPortfolioId,
                    assetId: exchangeData.assetId,
                    units: exchangeData.units * -1,
                },
                {
                    // coins in from asset portfolio
                    portfolioId: exchangeData.buyerPorfolioId,
                    assetId: coinAssetId,
                    units: exchangeData.coins * -1,
                },
            ],
            outputs: [
                {
                    // shares out to league asset
                    portfolioId: exchangeData.buyerPorfolioId,
                    assetId: exchangeData.assetId,
                    units: exchangeData.units,
                },
                {
                    // coins out to user portfolio
                    portfolioId: exchangeData.sellerPortfolioId,
                    assetId: coinAssetId,
                    units: exchangeData.coins,
                },
            ],
        }

        return this.executeTransactionAsync(transaction)
    }

    // EJH: used by league service mintLeagueAssetUnitsToPortfolioImpl(), fundLeagueImplAsync()
    // and userService depositCoins()
    // and transactionhandler..
    // a transfer is a transaction with one in put, out output, and one asset
    async executeTransferAsync(transferData: TTransfer) {
        //logger.debug(`Handle Transfer: ${JSON.stringify(transferData)}`)

        const inputPortfolioId = transferData.inputPortfolioId
        const outputPortfolioId = transferData.outputPortfolioId
        const assetId = transferData.assetId
        const units = transferData.units

        // const parts = inputPortfolioId.split(':')
        // if (parts.length > 0 && parts[0] === 'mint') {
        //     const msg = `Transfer Failed - input portfolio not valid. Cannot transfer from mint (${inputPortfolioId})`
        //     throw new ConflictError(msg, { payload: transferData })
        // }

        const transaction: TTransactionNew = {
            inputs: [
                {
                    portfolioId: inputPortfolioId,
                    assetId: assetId,
                    units: -1 * units,
                },
            ],
            outputs: [
                {
                    portfolioId: outputPortfolioId,
                    assetId: assetId,
                    units: units,
                },
            ],
        }
        if (transferData.tags) {
            transaction.tags = transferData.tags
        }

        return this.executeTransactionAsync(transaction)
    }

    // EJH: used by exchangeService xact()
    async executeTransactionAsync(transactionData: TTransactionNew) {
        //logger.debug(`Handle Create Transaction: ${JSON.stringify(transactionData)}`)

        const transaction = Transaction.newTransaction(transactionData)
        const transactionId = transaction.transactionId

        try {
            await this.transactionRepository.storeAsync(transaction)

            await this.validateLegsAsync(transaction)

            await this.verifyAssetsAsync(transaction)

            let commitStates = []

            //////////////////////////
            // process input legs first (if they fail, less to clean up)
            if (transaction.inputs) {
                const inputLegs = transaction.inputs
                for (let i = 0; i < inputLegs.length; ++i) {
                    const inputLeg = inputLegs[i]
                    const commitState = this.processLeg(transactionId, inputLeg, transaction.xids)
                    commitStates.push(commitState)
                }
            }

            //////////////////////////
            // process output legs (very little to make them fail)
            if (transaction.outputs) {
                const outputLegs = transaction.outputs
                for (let i = 0; i < outputLegs.length; ++i) {
                    const outputLeg = outputLegs[i]
                    const commitState = this.processLeg(transactionId, outputLeg, transaction.xids)
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
                        deltaNet: commitState.deltaNet,
                        deltaCost: commitState.deltaCost,
                    }
                })

                await this.portfolioHoldingService.proessTransaction(transactionId, updates, transaction)
            }

            transaction.status = 'success'
            await this.transactionRepository.updateAsync(transactionId, { status: transaction.status })

            // if (this.eventPublisher) {
            //     await this.eventPublisher.publishTransactionEventCompleteAsync(transaction, 'transactionHandler')
            // }

            return commitStates
        } catch (error: any) {
            if (error instanceof ValidationError) {
                // nothing will have been done yet so nothing to roll back
                transaction.status = 'failed'
                transaction.error = error.message
                await this.transactionRepository.updateAsync(transactionId, {
                    status: transaction.status,
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
                transaction.status = 'failed'
                transaction.error = error.message
                await this.transactionRepository.updateAsync(transactionId, {
                    status: transaction.status,
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
                transaction.status = 'failed'
                transaction.error = error.message
                await this.transactionRepository.updateAsync(transactionId, {
                    status: transaction.status,
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
                transaction.status = 'error'
                transaction.error = error.message
                await this.transactionRepository.updateAsync(transactionId, {
                    status: transaction.status,
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

    // EJH: Used by bootstrapService()
    // fund portfolio from treasury using portfolioId
    async mintCoinsToPortfolio(
        portfolioId: string,
        units: number,
        sourcePortfolioId: string = 'league::mint',
        assetId: string = 'coin::rkt',
    ) {
        const portfolio = await this.portfolioRepository.getDetailAsync(portfolioId)
        if (!portfolio) {
            const msg = `Cannot mint to portfolio: ${portfolioId} does not exist`
            throw new NotFoundError(msg, { portfolioId })
        }
        return this.mintCoinsToPortfolioImpl(portfolio, units, sourcePortfolioId, assetId)
    }

    ///////////////////////////////////////////
    // Private Methods
    ///////////////////////////////////////////

    // fund portfolio from treasury - implementation using portfolio entity
    private async mintCoinsToPortfolioImpl(
        portfolio: TPortfolio,
        units: number,
        sourcePortfolioId: string,
        assetId: string,
    ) {
        const portfolioId = portfolio.portfolioId

        const newTransactionData = {
            inputs: [
                {
                    portfolioId: sourcePortfolioId,
                    assetId,
                    units: units * -1,
                },
            ],
            outputs: [
                {
                    portfolioId,
                    assetId,
                    units,
                },
            ],
            tags: {
                source: 'FUND_PORTFOLIO',
            },
            xids: {
                assetId,
            },
        }

        await this.executeTransactionAsync(newTransactionData)
    }

    private async verifyAssetsAsync(transaction: Transaction) {
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

                const assetType = assetId.split(':')[0]
                const portfolioType = portfolioId.split(':')[0]

                const isCoin = assetType === 'coin'
                const isMint = portfolioType === 'mint'
                const isBank = portfolioType === 'bank'
                const isMaker = portfolioType === 'maker'
                const isLeague = portfolioType === 'league'
                const canShort = isMint || isBank || isMaker || isLeague

                // EJH TEST TEST TEST
                // configure so anything can run negative balance
                //const canShort = true

                // eslint-disable-next-line no-await-in-loop
                let holding = await this.portfolioHoldingRepository.getDetailAsync(portfolioId, assetId)
                if (canShort) {
                    // if can short, create input holding if it doesn't already
                    // exist. new holding may end up with negative balance. (if cannot
                    // short and no holding, then will fail for insufficient balance)
                    if (!holding) {
                        // eslint-disable-next-line no-await-in-loop
                        holding = await this.portfolioHoldingService.createPortfolioHolding(portfolioId, assetId)
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

                const unitCost = holding.units === 0 ? 0 : round4((holding.cost || 0) / holding.units)
                if (!isCoin) {
                    inputLeg._unitCost = unitCost
                    inputLeg._deltaCost = round4(unitCost * units)
                    inputLeg._deltaNet = round4(inputLeg.cost || 0) * -1
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
                let holding = await this.portfolioHoldingRepository.getDetailAsync(portfolioId, assetId)
                if (!holding) {
                    // eslint-disable-next-line no-await-in-loop
                    holding = await this.portfolioHoldingService.createPortfolioHolding(portfolioId, assetId)
                }

                if (!isCoin) {
                    outputLeg._deltaCost = round4(outputLeg.cost || 0)
                    outputLeg._deltaNet = round4(outputLeg.cost || 0) * -1
                }
            }
        }
    }

    // validate the legs. will throw if anything is wrong.
    private async validateLegsAsync(transaction: Transaction) {
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
        const imbalance = this.verifyTransactionBalance(transaction)
        if (imbalance) {
            // eslint-disable-next-line no-await-in-loop
            const msg = `inputs/outputs not balanced (${imbalance})`
            throw new InvalidTransaction(msg)
        }
    }

    private verifyTransactionBalance(transaction: Transaction) {
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

    private processLeg(transactionId: string, leg: TransactionLeg, transactionXids: any) {
        const timeAtNow = DateTime.utc().toString()
        const commitState: any = {
            id: generateId(),
            transactionId: transactionId,
            portfolioId: leg.portfolioId,
            assetId: leg.assetId,
            units: leg.units,
            deltaNet: leg._deltaNet || 0,
            deltaCost: leg._deltaCost || 0,
            timestamp: timeAtNow,
        }

        if (transactionXids) {
            commitState.xids = transactionXids
        }

        return commitState
    }
}
