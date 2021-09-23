'use strict'

import {
    round4,
    ConflictError,
    InsufficientBalance,
    TransactionService,
    PortfolioRepository,
    MarketMakerService,
    ExchangeQuoteRepository,
    INotificationPublisher,
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
    private marketMakerService: MarketMakerService

    constructor(eventPublisher?: INotificationPublisher) {
        this.assetHolderRepository = new AssetHolderRepository()
        this.portfolioRepository = new PortfolioRepository()
        this.userRepository = new UserRepository()
        this.assetRepository = new AssetRepository()
        this.exchangeQuoteRepository = new ExchangeQuoteRepository()

        this.transactionService = new TransactionService(eventPublisher)
        this.marketMakerService = new MarketMakerService()
    }

    async buy(userId: string, assetId: string, orderSize: number) {
        return this.user_transact(userId, assetId, 'bid', orderSize)
    }

    async sell(userId: string, assetId: string, orderSize: number) {
        return this.user_transact(userId, assetId, 'ask', orderSize)
    }

    async user_transact(userId: string, assetId: string, orderSide: string, orderSize: number) {
        const user = await this.userRepository.getDetailAsync(userId)
        if (!user) {
            const msg = `Order Failed - user not found (${userId})`
            throw new ConflictError(msg)
        }
        const portfolioId = user.portfolioId
        if (!portfolioId) {
            const msg = `Order Failed - user portfolio not found (${userId})`
            throw new ConflictError(msg)
        }
        return this.portfolio_transact(portfolioId, assetId, orderSide, orderSize)
    }

    async portfolio_transact(portfolioId: string, assetId: string, orderSide: string, orderSize: number) {
        if (orderSide === 'bid') {
            await this.verifyAssetsAsync(portfolioId, assetId, orderSide, orderSize)
        } else if (orderSide === 'ask') {
            await this.verifyFundsAsync(portfolioId, assetId, orderSide, orderSize)
        }

        const asset = await this.assetRepository.getDetailAsync(assetId)
        if (!asset) {
            const msg = `Order Failed - asset not found (${assetId})`
            throw new ConflictError(msg)
        }
        const assetPortfolioId = asset.portfolioId
        if (!assetPortfolioId) {
            const msg = `Order Failed - asset portfolio not defined (${assetId})`
            throw new ConflictError(msg)
        }

        const maker = await this.marketMakerService.getMakerAsync(assetId)
        if (!maker) {
            const msg = `Order Failed - marketMaker not found (${assetId})`
            throw new ConflictError(msg)
        }

        const tradeUnits = await maker.processOrderImpl(orderSide, orderSize)
        if (tradeUnits) {
            const { makerDeltaUnits, makerDeltaValue } = tradeUnits

            if (makerDeltaUnits) {
                const orderId = '--NA--'
                const tradeId = '--NA--'
                const takerPortfolioId = portfolioId
                const takerDeltaUnits = makerDeltaUnits * -1
                const takerDeltaValue = makerDeltaValue * -1
                const makerPortfolioId = assetPortfolioId

                await this.process_transaction(
                    orderId,
                    assetId,
                    tradeId,
                    takerPortfolioId,
                    takerDeltaUnits,
                    takerDeltaValue,
                    makerPortfolioId,
                )
            }
        }
    }

    ////////////////////////////////////////////////////////
    // PRIVATE
    ////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////
    //  xact
    //  - submit new order (order or cancel) to order book
    ////////////////////////////////////////////////////
    private async process_transaction(
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
                    },
                    {
                        portfolioId: takerPortfolioId,
                        assetId: 'coin::rkt',
                        units: takerDeltaValue,
                    },
                ],
                outputs: [
                    {
                        portfolioId: takerPortfolioId,
                        assetId,
                        units: takerDeltaUnits,
                    },
                    {
                        portfolioId: makerPortfolioId,
                        assetId: 'coin::rkt',
                        units: takerDeltaValue * -1,
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
                    },
                    {
                        portfolioId: makerPortfolioId,
                        assetId: 'coin::rkt',
                        units: takerDeltaValue * -1,
                    },
                ],
                outputs: [
                    {
                        portfolioId: makerPortfolioId,
                        assetId,
                        units: takerDeltaUnits * -1,
                    },
                    {
                        portfolioId: takerPortfolioId,
                        assetId: 'coin::rkt',
                        units: takerDeltaValue,
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
            const msg = `Order Failed - input portfolioId not registered (${portfolioId})`
            throw new ConflictError(msg)
        }

        const unitsRequired = orderSide === 'ask' ? round4(orderSize) : 0

        if (unitsRequired > 0) {
            const portfolioHoldings = await this.assetHolderRepository.getDetailAsync(assetId, portfolioId)
            const portfolioHoldingUnits = round4(portfolioHoldings?.units || 0)
            if (portfolioHoldingUnits < unitsRequired) {
                // exception
                const msg = `Order Failed:  portfolio: [${portfolioId}] holding: [${assetId}] has: [${portfolioHoldingUnits}] of required: [${unitsRequired}] `
                throw new InsufficientBalance(msg)
            }
        }
    }

    private async verifyFundsAsync(portfolioId: string, assetId: string, orderSide: string, orderSize: number) {
        // verify that portfolio exists.
        const portfolio = await this.portfolioRepository.getDetailAsync(portfolioId)
        if (!portfolio) {
            const msg = `Order Failed - input portfolioId not registered (${portfolio})`
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
                const msg = `Order Failed -  portfolio: [${portfolioId}] holding: [${paymentAssetId}]  has: [${portfolioHoldingUnits}] of required: [${coinsRequired}] `
                throw new InsufficientBalance(msg)
            }
        }
    }
}
