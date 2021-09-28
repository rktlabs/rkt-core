'use strict'

import { EventEmitter } from 'events'
import * as log4js from 'log4js'
import { DateTime } from 'luxon'
import { TransactionService, MarketMakerFactory } from '.'
import {
    ExchangeOrderRepository,
    ExchangeTradeRepository,
    ExchangeQuoteRepository,
    PortfolioRepository,
    AssetHolderRepository,
    AssetRepository,
    TransactionRepository,
    MarketMakerRepository,
    TExchangeOrderFill,
    TExchangeOrderFailed,
    TNewExchangeOrderConfig,
    ExchangeOrder,
    TExchangeQuote,
    ExchangeTrade,
    TExchangeOrderPatch,
    TMaker,
    TTaker,
    round4,
    TTransactionNew,
    OrderSide,
    ConflictError,
    InsufficientBalance,
} from '..'

const logger = log4js.getLogger('ExchangeService')

///////////////////////////////////////////////////
// Exchnage Service
// - recieves orders
// - resolves markerMakr for asset in order
// - applies order to markerMaker
// - emits order events as order is processecd
// - applies transaction returned from marketMaker?

export class ExchangeService {
    private emitter: EventEmitter

    private exchangeOrderRepository: ExchangeOrderRepository
    private exchangeTradeRepository: ExchangeTradeRepository
    private exchangeQuoteRepository: ExchangeQuoteRepository

    private portfolioRepository: PortfolioRepository
    private assetHolderRepository: AssetHolderRepository
    private transactionService: TransactionService
    private marketMakerService: MarketMakerFactory

    constructor(
        assetRepository: AssetRepository,
        portfolioRepository: PortfolioRepository,
        transactionRepository: TransactionRepository,
        marketMakerRepository: MarketMakerRepository,
        emitter?: EventEmitter,
    ) {
        this.assetHolderRepository = new AssetHolderRepository()
        this.portfolioRepository = portfolioRepository

        this.exchangeOrderRepository = new ExchangeOrderRepository()
        this.exchangeTradeRepository = new ExchangeTradeRepository()
        this.exchangeQuoteRepository = new ExchangeQuoteRepository()

        this.transactionService = new TransactionService(assetRepository, portfolioRepository, transactionRepository)
        this.marketMakerService = new MarketMakerFactory(
            assetRepository,
            portfolioRepository,
            transactionRepository,
            marketMakerRepository,
        )

        if (emitter) {
            this.emitter = emitter
        } else {
            this.emitter = new EventEmitter()
        }
    }

    on(event: string, listener: (...args: any[]) => void) {
        this.emitter.on(event, listener)
    }

    emitOrderExecution(event: TExchangeOrderFill) {
        this.emitter.emit('orderExecution', event)
    }

    emitOrderFail(event: TExchangeOrderFailed) {
        this.emitter.emit('orderExecution', event)
    }

    ////////////////////////////////////////////////////
    //  handleNewExchangeOrderAsync
    //  - new order handler - accepts raw json as input
    ////////////////////////////////////////////////////
    async processOrder(orderPayload: TNewExchangeOrderConfig) {
        logger.trace(`processOrder`, orderPayload)

        let exchangeOrder: ExchangeOrder | undefined
        try {
            ////////////////////////////////////
            // Verify source portfolio has adequate funds/units to complete transaction
            ////////////////////////////////////
            const portfolioId = orderPayload.portfolioId
            const assetId = orderPayload.assetId
            const orderSide = orderPayload.orderSide
            const orderSize = orderPayload.orderSize

            ////////////////////////////////////////////////////////
            // Process the order
            ////////////////////////////////////////////////////////

            const marketMaker = await this.marketMakerService.getMarketMakerAsync(assetId)
            if (marketMaker) {
                ////////////////////////////////////////////////////////
                // Set up the handlers for emitted trades and quote updates
                ////////////////////////////////////////////////////////
                marketMaker.on('quote', (quote: TExchangeQuote) => {
                    this._onUpdateQuote(quote)
                })
                marketMaker.on('trade', (trade: ExchangeTrade) => {
                    this._onTrade(trade)
                })

                if (orderSide === 'bid') {
                    await this._verifyAssetsAsync(portfolioId, assetId, orderSide, orderSize)
                } else if (orderSide === 'ask') {
                    ////////////////////////////
                    // get bid price and verify funds
                    ////////////////////////////
                    const currentPrice = marketMaker?.quote?.ask || 1
                    await this._verifyFundsAsync(portfolioId, orderSide, orderSize, currentPrice)
                }

                ////////////////////////////////////
                // order is reasonably complete so mark it as received
                // and STORE it
                ////////////////////////////////////
                exchangeOrder = ExchangeOrder.newExchangeOrder(orderPayload)
                await this.exchangeOrderRepository.storeAsync(exchangeOrder)

                const orderId = exchangeOrder.orderId

                const order = MarketMakerFactory.generateOrder({
                    operation: 'order',
                    orderType: 'market',
                    assetId: assetId,
                    orderId: orderId,
                    portfolioId: portfolioId,
                    orderSide: orderSide,
                    orderSize: orderSize,
                })

                await marketMaker.processOrder(order)
            }
        } catch (error: any) {
            if (exchangeOrder && exchangeOrder.orderStatus === 'received') {
                // received and stored
                const reason = error.message

                const updateData: TExchangeOrderPatch = {
                    orderStatus: 'error',
                    orderState: 'closed',
                    closedAt: DateTime.utc().toString(),
                }
                if (reason) updateData.reason = reason
                await this.exchangeOrderRepository.updateAsync(exchangeOrder.orderId, updateData)

                this.emitOrderFail({
                    eventType: 'orderFail',
                    publishedAt: DateTime.utc().toString(),
                    orderId: exchangeOrder.orderId,
                    portfolioId: exchangeOrder.portfolioId,
                    reason: reason,
                })
            }

            logger.error(error)
            throw error
        }
        return exchangeOrder
    }

    ////////////////////////////////////////////////////////
    // PRIVATE
    ////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////
    //  onTrade
    //  - store trade
    //  - publish trade to clearing house
    ////////////////////////////////////////////////////
    private async _onTrade(trade: ExchangeTrade) {
        logger.info('onTrade', trade)
        if (trade) {
            if (trade.taker.filledSize) {
                await this.exchangeTradeRepository.storeAsync(trade) // async - don't wait to finish

                await this._processTransaction(
                    trade.taker.orderId,
                    trade.assetId,
                    trade.tradeId,
                    trade.taker.portfolioId,
                    trade.taker.filledSize,
                    trade.taker.filledValue,
                    trade.makers[0].portfolioId,
                )

                await this._deliverOrderUpdateStatus(trade)
            }
        }
    }

    ////////////////////////////////////////////////////
    //  onFill
    //  - handle order fill resulting from trade
    ////////////////////////////////////////////////////
    private async _deliverOrderUpdateStatus(trade: ExchangeTrade) {
        /////////////////////////
        // first do taker
        /////////////////////////
        // NOTE: This is an async operation with no wait.
        this._deliverTakerOrderUpdate(trade.tradeId, trade.taker)

        /////////////////////////
        // Then do makers
        /////////////////////////
        // NOTE: This is an async operation with no wait.
        trade.makers.forEach(async (maker: TMaker) => {
            this._deliverMakerOrderUpdate(trade.tradeId, maker)
        })
    }

    private async _deliverMakerOrderUpdate(tradeId: string, maker: TMaker) {
        // nothing to do here right now.
        // for Automated market makers, there is no source order so nothing to notify
        if (maker.orderId) {
            logger.warn('Maker Update should not be here. should be no order Id for maker with AMM')
        }
    }

    private async _deliverTakerOrderUpdate(tradeId: string, taker: TTaker) {
        this._updateExchangeOrder(taker.orderId, {
            orderStatus: taker.isClosed ? 'filled' : 'partial',
            orderState: !taker.isClosed && taker.sizeRemaining > 0 ? 'open' : 'closed',
            executedAt: DateTime.utc().toString(),
            filledSize: taker.filledSize,
            filledValue: taker.filledValue,
            filledPrice: taker.filledPrice,
            sizeRemaining: taker.sizeRemaining,
        }) // async - don't wait to finish

        const event: TExchangeOrderFill = {
            eventType: 'orderExecution',
            publishedAt: DateTime.utc().toString(),
            orderId: taker.orderId,
            portfolioId: taker.portfolioId,
            filledSize: taker.filledSize,
            filledValue: taker.filledValue,
            filledPrice: taker.filledPrice,
            sizeRemaining: taker.sizeRemaining,
            tradeId: tradeId,
        }

        this.emitOrderExecution(event)
    }

    private _updateExchangeOrder = async (orderId: string, payload: TExchangeOrderPatch) => {
        let exchangeOrder = await this.exchangeOrderRepository.getDetailAsync(orderId)
        if (!exchangeOrder) {
            return
        }

        exchangeOrder.filledSize = (exchangeOrder.filledSize || 0) + (payload.filledSize || 0)
        exchangeOrder.filledValue = (exchangeOrder.filledValue || 0) + (payload.filledValue || 0)
        exchangeOrder.filledPrice =
            exchangeOrder.filledSize === 0 ? 0 : Math.abs(round4(exchangeOrder.filledValue / exchangeOrder.filledSize))
        exchangeOrder.sizeRemaining = payload.sizeRemaining

        const orderUpdate: TExchangeOrderPatch = {
            orderStatus: payload.orderStatus,
            orderState: payload.orderState,
            executedAt: payload.executedAt,
            filledSize: exchangeOrder.filledSize,
            filledValue: exchangeOrder.filledValue,
            filledPrice:
                exchangeOrder.filledSize === 0
                    ? 0
                    : Math.abs(round4(exchangeOrder.filledValue / exchangeOrder.filledSize)),
            sizeRemaining: exchangeOrder.sizeRemaining,
        }

        await this.exchangeOrderRepository.updateAsync(orderId, orderUpdate)

        return exchangeOrder
    }

    ////////////////////////////////////////////////////
    //  onUpdateQuote
    //  - store new quoted for the asset indicated
    ////////////////////////////////////////////////////
    private _onUpdateQuote = async (quote: TExchangeQuote) => {
        await this.exchangeQuoteRepository.storeAsync(quote.assetId, quote)
    }

    ////////////////////////////////////////////////////
    //  xact
    //  - submit new order (order or cancel) to order book
    ////////////////////////////////////////////////////
    private async _processTransaction(
        takerOrderId: string,
        assetId: string,
        tradeId: string,
        takerPortfolioId: string,
        takerDeltaUnits: number,
        takerDeltaValue: number,
        makerPortfolioId: string,
    ) {
        let newTransactionData: TTransactionNew

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
            }
        }

        newTransactionData.tags = { source: 'Trade' }

        // set the orderId
        newTransactionData.xids = {
            orderId: takerOrderId,
            orderPortfolioId: takerPortfolioId,
            tradeId: tradeId,
        }

        return this.transactionService.executeTransactionAsync(newTransactionData)
    }

    private async _verifyAssetsAsync(portfolioId: string, assetId: string, orderSide: OrderSide, orderSize: number) {
        // verify that portfolio exists.
        const portfolio = await this.portfolioRepository.getDetailAsync(portfolioId)
        if (!portfolio) {
            const msg = `Order Failed - input portfolioId not registered (${portfolioId})`
            logger.error(msg)
            throw new ConflictError(msg)
        }

        const unitsRequired = orderSide === 'ask' ? round4(orderSize) : 0

        if (unitsRequired > 0) {
            const portfolioHoldings = await this.assetHolderRepository.getDetailAsync(assetId, portfolioId)
            const portfolioHoldingUnits = round4(portfolioHoldings?.units || 0)
            if (portfolioHoldingUnits < unitsRequired) {
                // exception
                const msg = `Order Failed:  portfolio: [${portfolioId}] holding: [${assetId}] has: [${portfolioHoldingUnits}] of required: [${unitsRequired}] `
                logger.error(msg)
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
            logger.error(msg)
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
                logger.error(msg)
                throw new InsufficientBalance(msg)
            }
        }
    }
}
