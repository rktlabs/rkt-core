'use strict'

import {
    round4,
    ConflictError,
    InsufficientBalance,
    TransactionService,
    PortfolioRepository,
    MakerService,
    ExchangeQuoteRepository,
    IEventPublisher,
    AssetHolderRepository,
    UserRepository,
    AssetRepository,
} from '..'

export class SimpleExchangeService {
    private userRepository: UserRepository
    private assetRepository: AssetRepository
    private portfolioRepository: PortfolioRepository
    private assetHolderRepository: AssetHolderRepository
    private exchangeQuoteRepository: ExchangeQuoteRepository
    private transactionService: TransactionService
    private makerService: MakerService

    constructor(eventPublisher?: IEventPublisher) {
        this.assetHolderRepository = new AssetHolderRepository()
        this.portfolioRepository = new PortfolioRepository()
        this.userRepository = new UserRepository()
        this.assetRepository = new AssetRepository()
        this.exchangeQuoteRepository = new ExchangeQuoteRepository()

        this.transactionService = new TransactionService(eventPublisher)
        this.makerService = new MakerService()
    }

    async buy(userId: string, assetId: string, units: number) {
        return this.transact(userId, assetId, 'bid', units)
    }

    async sell(userId: string, assetId: string, units: number) {
        return this.transact(userId, assetId, 'ask', units)
    }

    async transact(userId: string, assetId: string, orderSide: string, orderSize: number) {
        const user = await this.userRepository.getDetailAsync(userId)
        if (!user) {
            return null
        }
        const portfolioId = user.portfolioId
        if (!portfolioId) {
            return null
        }

        const asset = await this.assetRepository.getDetailAsync(assetId)
        if (!asset) {
            return null
        }
        const assetPortfolioId = asset.portfolioId
        if (!assetPortfolioId) {
            return null
        }

        const orderId = '--NA--' // orderId

        const maker = await this.makerService.getMakerAsync(assetId)
        if (!maker) {
            return null
        }

        if (orderSide === 'bid') {
            await this.verifyAssetsAsync(portfolioId, assetId, orderSide, orderSize)
        } else if (orderSide === 'ask') {
            await this.verifyFundsAsync(portfolioId, assetId, orderSide, orderSize)
        }

        const tradeUnits = await maker.processSimpleOrder(assetId, orderSide, orderSize)
        if (!tradeUnits) {
            return null
        }

        const { makerDeltaUnits, makerDeltaCoins } = tradeUnits

        if (makerDeltaUnits) {
            const takerPortfolioId = portfolioId
            const takerDeltaUnits = makerDeltaUnits * -1
            const takerDeltaValue = makerDeltaCoins * -1
            const makerPortfolioId = assetPortfolioId

            await this.xact(
                orderId,
                assetId,
                '--NA--', // tradeId
                takerPortfolioId,
                takerDeltaUnits,
                takerDeltaValue,
                makerPortfolioId,
            )
        }
    }

    ////////////////////////////////////////////////////////
    // PRIVATE
    ////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////
    //  xact
    //  - submit new order (order or cancel) to order book
    ////////////////////////////////////////////////////
    private async xact(
        orderId: string,
        assetId: string,
        tradeId: string,
        takerPortfolioId: string,
        takerDeltaUnits: number,
        takerDeltaValue: number,
        makerPortfolioId: string,
    ) {
        let newTransactionData: any

        if (takerDeltaUnits > 0) {
            // deltaUnits > 0 means adding to taker portfolio from asset
            // NOTE: Transaction inputs must have negative size so have to do transaction
            // differetnly depending on direction of trade
            newTransactionData = {
                inputs: [
                    {
                        portfolioId: makerPortfolioId,
                        assetId,
                        units: takerDeltaUnits * -1,
                        cost: takerDeltaValue,
                    },
                    {
                        portfolioId: takerPortfolioId,
                        assetId: 'coin::rkt',
                        units: takerDeltaValue,
                        cost: takerDeltaValue,
                    },
                ],
                outputs: [
                    {
                        portfolioId: takerPortfolioId,
                        assetId,
                        units: takerDeltaUnits,
                        cost: takerDeltaValue * -1,
                    },
                    {
                        portfolioId: makerPortfolioId,
                        assetId: 'coin::rkt',
                        units: takerDeltaValue * -1,
                        cost: takerDeltaValue * -1,
                    },
                ],
                tags: {
                    source: 'Simple',
                },
                xids: {
                    portfolioId: takerPortfolioId,
                    orderId,
                    tradeId,
                },
            }
        } else {
            newTransactionData = {
                inputs: [
                    {
                        portfolioId: takerPortfolioId,
                        assetId,
                        units: takerDeltaUnits,
                        cost: takerDeltaValue * -1,
                    },
                    {
                        portfolioId: makerPortfolioId,
                        assetId: 'coin::rkt',
                        units: takerDeltaValue * -1,
                        cost: takerDeltaValue * -1,
                    },
                ],
                outputs: [
                    {
                        portfolioId: makerPortfolioId,
                        assetId,
                        units: takerDeltaUnits * -1,
                        cost: takerDeltaValue,
                    },
                    {
                        portfolioId: takerPortfolioId,
                        assetId: 'coin::rkt',
                        units: takerDeltaValue,
                        cost: takerDeltaValue,
                    },
                ],
                tags: {
                    source: 'Simple',
                },
                xids: {
                    portfolioId: takerPortfolioId,
                    orderId,
                    tradeId,
                },
            }
        }

        return this.transactionService.executeTransactionAsync(newTransactionData)
    }

    private async verifyAssetsAsync(portfolioId: string, assetId: string, orderSide: string, orderSize: number) {
        // verify that portfolio exists.
        const portfolio = await this.portfolioRepository.getDetailAsync(portfolioId)
        if (!portfolio) {
            const msg = `Simple Order Failed - input portfolioId not registered (${portfolioId})`
            throw new ConflictError(msg)
        }

        const unitsRequired = orderSide === 'ask' ? round4(orderSize) : 0

        if (unitsRequired > 0) {
            const portfolioHoldings = await this.assetHolderRepository.getDetailAsync(assetId, portfolioId)
            const portfolioHoldingUnits = round4(portfolioHoldings?.units || 0)
            if (portfolioHoldingUnits < unitsRequired) {
                // exception
                const msg = `Simple Order Failed:  portfolio: [${portfolioId}] asset holding: [${assetId}] has: [${portfolioHoldingUnits}] of required: [${unitsRequired}] `
                throw new InsufficientBalance(msg)
            }
        }
    }

    private async verifyFundsAsync(portfolioId: string, assetId: string, orderSide: string, orderSize: number) {
        // verify that portfolio exists.
        const portfolio = await this.portfolioRepository.getDetailAsync(portfolioId)
        if (!portfolio) {
            const msg = `Simple Order Failed - input portfolioId not registered (${portfolio})`
            throw new ConflictError(msg)
        }

        ////////////////////////////
        // get bid price and verify funds
        ////////////////////////////
        const quote = await this.exchangeQuoteRepository.getDetailAsync(assetId)
        const price = quote?.bid || 1

        const COIN_BUFFER_FACTOR = 1.05
        const paymentAssetId = 'coin::rkt'
        const coinsRequired = orderSide === 'bid' ? round4(orderSize * price) * COIN_BUFFER_FACTOR : 0

        if (coinsRequired > 0) {
            const coinsHeld = await this.assetHolderRepository.getDetailAsync(paymentAssetId, portfolioId)
            const portfolioHoldingUnits = round4(coinsHeld?.units || 0)
            if (portfolioHoldingUnits < coinsRequired) {
                // exception
                const msg = `Simple Order Failed -  portfolio: [${portfolioId}] coin holding: [${paymentAssetId}] has: [${portfolioHoldingUnits}] of required: [${coinsRequired}] `
                throw new InsufficientBalance(msg)
            }
        }
    }
}
