'use strict'

import {
    AssetHolderRepository,
    AssetRepository,
    ConflictError,
    INotificationPublisher,
    InsufficientBalance,
    MarketMakerRepository,
    MarketMakerService,
    OrderSide,
    PortfolioRepository,
    round4,
    TransactionRepository,
    TransactionService,
    UserRepository,
} from '..'

export class SimpleExchangeService {
    private userRepository: UserRepository
    private assetRepository: AssetRepository
    private portfolioRepository: PortfolioRepository
    private assetHolderRepository: AssetHolderRepository
    private transactionService: TransactionService
    private marketMakerService: MarketMakerService

    constructor(
        assetRepository: AssetRepository,
        portfolioRepository: PortfolioRepository,
        transactionRepository: TransactionRepository,
        userRepository: UserRepository,
        marketMakerRepository: MarketMakerRepository,
        eventPublisher?: INotificationPublisher,
    ) {
        this.assetHolderRepository = new AssetHolderRepository()
        this.portfolioRepository = portfolioRepository
        this.userRepository = userRepository
        this.assetRepository = assetRepository

        this.transactionService = new TransactionService(
            assetRepository,
            portfolioRepository,
            transactionRepository,
            eventPublisher,
        )
        this.marketMakerService = new MarketMakerService(
            assetRepository,
            portfolioRepository,
            transactionRepository,
            marketMakerRepository,
        )
    }

    async buy(userId: string, assetId: string, orderSize: number) {
        return this.user_transact(userId, assetId, 'bid', orderSize)
    }

    async sell(userId: string, assetId: string, orderSize: number) {
        return this.user_transact(userId, assetId, 'ask', orderSize)
    }

    async user_transact(userId: string, assetId: string, orderSide: OrderSide, orderSize: number) {
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

    async portfolio_transact(portfolioId: string, assetId: string, orderSide: OrderSide, orderSize: number) {
        const marketMaker = await this.marketMakerService.getMarketMakerAsync(assetId)
        if (!marketMaker) {
            const msg = `Order Failed - marketMaker not found (${assetId})`
            throw new ConflictError(msg)
        }

        if (orderSide === 'bid') {
            await this._verifyAssetsAsync(portfolioId, assetId, orderSide, orderSize)
        } else if (orderSide === 'ask') {
            const currentPrice = marketMaker?.quote?.bid1 || 1
            await this._verifyFundsAsync(portfolioId, orderSide, orderSize, currentPrice)
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

        const tradeUnits = await marketMaker.processOrderImpl(orderSide, orderSize)
        if (tradeUnits) {
            const { makerDeltaUnits, makerDeltaValue } = tradeUnits

            if (makerDeltaUnits) {
                const orderId = '--NA--'
                const tradeId = '--NA--'
                const takerPortfolioId = portfolioId
                const takerDeltaUnits = makerDeltaUnits * -1
                const takerDeltaValue = makerDeltaValue * -1
                const makerPortfolioId = assetPortfolioId

                await this._process_transaction(
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
    private async _process_transaction(
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

    private async _verifyAssetsAsync(portfolioId: string, assetId: string, orderSide: OrderSide, orderSize: number) {
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

    private async _verifyFundsAsync(
        portfolioId: string,
        orderSide: OrderSide,
        orderSize: number,
        currentPrice: number = 0,
    ) {
        // verify that portfolio exists.
        const portfolio = await this.portfolioRepository.getDetailAsync(portfolioId)
        if (!portfolio) {
            const msg = `Order Failed - input portfolioId not registered (${portfolio})`
            throw new ConflictError(msg)
        }

        ////////////////////////////
        // get bid price and verify funds
        ////////////////////////////

        const COIN_BUFFER_FACTOR = 1.05
        const paymentAssetId = 'coin::rkt'
        const coinsRequired = orderSide === 'bid' ? round4(orderSize * currentPrice) * COIN_BUFFER_FACTOR : 0

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
