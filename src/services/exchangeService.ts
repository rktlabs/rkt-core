'use strict'

import * as log4js from 'log4js'
import { DateTime } from 'luxon'
import {
    AssetHolderRepository,
    AssetRepository,
    ConflictError,
    ExchangeOrder,
    ExchangeOrderRepository,
    ExchangeQuoteRepository,
    ExchangeTradeRepository,
    IMarketMaker,
    INotificationPublisher,
    InsufficientBalance,
    MarketMakerRepository,
    MarketMakerService,
    NullNotificationPublisher,
    OrderSide,
    PortfolioRepository,
    round4,
    TExchangeQuote,
    TNewExchangeOrderConfig,
    Trade,
    TransactionRepository,
    TransactionService,
    TTaker,
} from '..'
const logger = log4js.getLogger()

///////////////////////////////////////////////////
// Exchnage Service
// - recieves orders
// - resolves markerMakr for asset in order
// - applies order to markerMaker
// - emits order events as order is processecd
// - applies transaction returned from marketMaker?

export class ExchangeService {
    private orderNotificationPublisher: INotificationPublisher

    private portfolioRepository: PortfolioRepository
    private assetHolderRepository: AssetHolderRepository
    private exchangeOrderRepository: ExchangeOrderRepository
    private exchangeTradeRepository: ExchangeTradeRepository
    private exchangeQuoteRepository: ExchangeQuoteRepository
    private transactionService: TransactionService
    private marketMakerService: MarketMakerService

    constructor(
        assetRepository: AssetRepository,
        portfolioRepository: PortfolioRepository,
        transactionRepository: TransactionRepository,
        marketMakerRepository: MarketMakerRepository,
        eventPublisher?: INotificationPublisher,
    ) {
        this.orderNotificationPublisher = eventPublisher || new NullNotificationPublisher()

        this.assetHolderRepository = new AssetHolderRepository()
        this.portfolioRepository = portfolioRepository

        this.exchangeOrderRepository = new ExchangeOrderRepository()
        this.exchangeTradeRepository = new ExchangeTradeRepository()
        this.exchangeQuoteRepository = new ExchangeQuoteRepository()

        this.transactionService = new TransactionService(assetRepository, portfolioRepository, transactionRepository)
        this.marketMakerService = new MarketMakerService(
            assetRepository,
            portfolioRepository,
            transactionRepository,
            marketMakerRepository,
        )
    }

    ////////////////////////////////////////////////////
    //  handleNewExchangeOrderAsync
    //  - new order handler - accepts raw json as input
    ////////////////////////////////////////////////////
    async processNewExchangeOrderAsync(orderPayload: TNewExchangeOrderConfig) {
        logger.debug(`processNewExchangeOrderAsync: ${JSON.stringify(orderPayload)}`)

        let exchangeOrder: ExchangeOrder | undefined
        try {
            ////////////////////////////////////
            // Verify source portfolio has adequate funds/units to complete transaction
            ////////////////////////////////////
            const portfolioId = orderPayload.portfolioId
            const assetId = orderPayload.assetId
            const orderSide = orderPayload.orderSide
            const orderSize = orderPayload.orderSize

            // TODO TODO - get quoted from marketMaker. get marketMaker first here. will
            // eliminate redundant read
            ////////////////////////////////////////////////////////
            // Process the order
            ////////////////////////////////////////////////////////

            const marketMaker = await this.marketMakerService.getMarketMakerAsync(assetId)
            if (marketMaker) {
                if (orderSide === 'bid') {
                    await this.verifyAssetsAsync(portfolioId, assetId, orderSide, orderSize)
                } else if (orderSide === 'ask') {
                    ////////////////////////////
                    // get bid price and verify funds
                    ////////////////////////////
                    const currentPrice = marketMaker?.quote?.bid1 || 1
                    await this.verifyFundsAsync(portfolioId, orderSide, orderSize, currentPrice)
                }

                ////////////////////////////////////
                // order is reasonably complete so mark it as received
                // and STORE it
                ////////////////////////////////////
                exchangeOrder = ExchangeOrder.newExchangeOrder(orderPayload)
                exchangeOrder.status = 'received'
                await this.exchangeOrderRepository.storeAsync(exchangeOrder)

                const orderId = exchangeOrder.orderId

                const order = MarketMakerService.generateOrder({
                    assetId: assetId,
                    orderId: orderId,
                    portfolioId: portfolioId,
                    orderSide: orderSide as OrderSide,
                    orderSize: orderSize,
                })

                const trade = await marketMaker.processOrder(order)

                if (trade) {
                    if (trade.taker.filledSize) {
                        await this.onFill(trade.taker)
                        await this.onTrade(trade)
                        await this.onUpdateQuote(marketMaker)

                        const takerPortfolioId = trade.taker.portfolioId
                        const takerDeltaUnits = trade.taker.filledSize
                        const takerDeltaValue = trade.taker.filledValue

                        const makerPortfolioId = trade.makers[0].portfolioId

                        await this.process_transaction(
                            orderId,
                            exchangeOrder.assetId,
                            trade.tradeId,
                            takerPortfolioId,
                            takerDeltaUnits,
                            takerDeltaValue,
                            makerPortfolioId,
                        )
                    }
                }
            }
        } catch (error: any) {
            if (exchangeOrder && exchangeOrder.status === 'received') {
                // received and stored
                const reason = error.message

                await this.exchangeOrderRepository.updateAsync(exchangeOrder.portfolioId, exchangeOrder.orderId, {
                    status: 'error',
                    state: 'closed',
                    closedAt: DateTime.utc().toString(),
                    reason,
                })

                // this.orderNotificationPublisher.publishOrderEventFailedAsync(
                //     exchangeOrder.portfolioId,
                //     exchangeOrder.orderId,
                //     reason,
                //     'marketMaker',
                // ) // async - don't wait to finish
            }

            throw error
        }
        return exchangeOrder
    }

    ////////////////////////////////////////////////////////
    // PRIVATE
    ////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////
    //  onFill
    //  - handle order fill resulting from trade
    ////////////////////////////////////////////////////

    private async onFill(taker: TTaker) {
        const orderId = taker.orderId
        const portfolioId = taker.portfolioId
        const filledSize = taker.filledSize
        const filledValue = taker.filledValue
        const filledPrice = taker.filledPrice
        const makerRemaining = taker.sizeRemaining

        // this.orderNotificationPublisher.publishOrderEventFillAsync(
        //     portfolioId,
        //     orderId,
        //     filledSize,
        //     filledValue,
        //     filledPrice,
        //     makerRemaining,
        //     'marketMaker',
        // ) // async - don't wait to finish

        const newMakerStatus = taker.isClosed ? 'filled' : 'partial'
        const newMakerState = !taker.isClosed && taker.sizeRemaining > 0 ? 'open' : 'closed'

        await this.exchangeOrderRepository.updateAsync(portfolioId, orderId, {
            status: newMakerStatus,
            state: newMakerState,
            executedAt: DateTime.utc().toString(),
            filledSize,
            filledValue,
            filledPrice,
            sizeRemaining: makerRemaining,
        }) // async - don't wait to finish
    }

    ////////////////////////////////////////////////////
    //  onTrade
    //  - store trade
    //  - publish trade to clearing house
    ////////////////////////////////////////////////////
    private onTrade = async (trade: Trade) => {
        await this.exchangeTradeRepository.storeAsync(trade) // async - don't wait to finish

        // this.orderNotificationPublisher.publishOrderEventCompleteAsync(
        //     trade.taker.portfolioId,
        //     trade.taker.orderId,
        //     trade.tradeId,
        //     'marketMaker',
        // ) // async - don't wait to finish
    }

    ////////////////////////////////////////////////////
    //  onUpdateQuote
    //  - store new quoted for the asset indicated
    ////////////////////////////////////////////////////
    private onUpdateQuote = async (marketMaker: IMarketMaker) => {
        const assetId = marketMaker.assetId
        const marketMakerQuote = marketMaker.quote
        const exchangeQuote: any = {
            assetId: marketMaker.assetId,
            ...marketMakerQuote,
        } as TExchangeQuote

        await this.exchangeQuoteRepository.storeAsync(assetId, exchangeQuote)
    }

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
                    source: 'AMM',
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
                    source: 'AMM',
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

    private async verifyFundsAsync(
        portfolioId: string,
        orderSide: string,
        orderSize: number,
        currentPrice: number = 0,
    ) {
        // verify that portfolio exists.
        const portfolio = await this.portfolioRepository.getDetailAsync(portfolioId)
        if (!portfolio) {
            const msg = `Order Failed - input portfolioId not registered (${portfolio})`
            throw new ConflictError(msg)
        }

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
