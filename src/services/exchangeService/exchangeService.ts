'use strict'

import * as log4js from 'log4js'
import { DateTime } from 'luxon'
const logger = log4js.getLogger()

import { MarketOrder, OrderSide, Trade, TakerFill } from '.'

import {
    ExchangeOrderRepository,
    ExchangeTradeRepository,
    TNewExchangeOrder,
    ExchangeOrder,
    round4,
    ConflictError,
    InsufficientBalance,
    EventPublisher,
    TransactionService,
    PortfolioHoldingRepository,
    PortfolioRepository,
    MakerService,
    ExchangeQuoteRepository,
} from '../..'

///////////////////////////////////////////////////
// Exchnage Service
// - recieves orders
// - resolves markerMakr for asset in order
// - applies order to markerMaker
// - emits order events as order is processecd
// - applies transaction returned from market maker?

export class ExchangeService {
    private orderEventPublisher: EventPublisher

    private portfolioRepository: PortfolioRepository
    private portfolioHoldingRepository: PortfolioHoldingRepository
    private exchangeOrderRepository: ExchangeOrderRepository
    private exchangeTradeRepository: ExchangeTradeRepository
    private exchangeQuoteRepository: ExchangeQuoteRepository
    private transactionService: TransactionService
    private makerFactoryService: MakerService

    constructor(eventPublisher?: EventPublisher) {
        this.orderEventPublisher = eventPublisher || new EventPublisher()

        this.portfolioHoldingRepository = new PortfolioHoldingRepository()
        this.portfolioRepository = new PortfolioRepository()

        this.exchangeOrderRepository = new ExchangeOrderRepository()
        this.exchangeTradeRepository = new ExchangeTradeRepository()
        this.exchangeQuoteRepository = new ExchangeQuoteRepository()

        this.transactionService = new TransactionService()
        this.makerFactoryService = new MakerService()
    }

    ////////////////////////////////////////////////////
    //  handleNewExchangeOrderAsync
    //  - new order handler - accepts raw json as input
    ////////////////////////////////////////////////////
    async handleNewExchangeOrderAsync(orderPayload: TNewExchangeOrder) {
        logger.debug(`Handle Exchange Order: ${JSON.stringify(orderPayload)}`)

        let exchangeOrder: ExchangeOrder | undefined
        try {
            // save order
            exchangeOrder = ExchangeOrder.newExchangeOrder(orderPayload)

            ////////////////////////////////////
            // order is reasonably complete so mark it as received
            // and STORE it
            ////////////////////////////////////
            exchangeOrder.status = 'received'
            await this.exchangeOrderRepository.storeAsync(exchangeOrder)

            ////////////////////////////////////
            // Verify source portfolio has adequate funds/units to complete transaction
            ////////////////////////////////////
            if (exchangeOrder.orderSide === 'bid') {
                await this.verifyAssetsAsync(exchangeOrder)
            } else if (exchangeOrder.orderSide === 'ask') {
                ////////////////////////////
                // get bid price and verify funds
                ////////////////////////////
                const quote = await this.exchangeQuoteRepository.getDetailAsync(exchangeOrder.assetId)
                const bid = quote?.bid || 1
                await this.verifyFundsAsync(exchangeOrder, bid)
            }

            // verify that maker exists.
            const orderId = exchangeOrder.orderId
            const orderSide = exchangeOrder.orderSide
            const orderSize = exchangeOrder.orderSize

            const order = new MarketOrder({
                assetId: exchangeOrder.assetId,
                orderId: exchangeOrder.orderId,
                portfolioId: exchangeOrder.portfolioId,
                orderSide: orderSide as OrderSide,
                orderSize: orderSize,
            })

            ////////////////////////////////////////////////////////
            // Process the order
            ////////////////////////////////////////////////////////

            const maker = await this.makerFactoryService.getMakerAsync(exchangeOrder.assetId)
            if (maker) {
                const trade = await maker.processOrder(maker, order)

                if (trade) {
                    if (trade.taker.filledSize) {
                        await this.onFill(trade.taker)
                        await this.onTrade(trade)

                        const takerPortfolioId = trade.taker.portfolioId
                        const takerDeltaUnits = trade.taker.filledSize
                        const takerDeltaValue = trade.taker.filledValue

                        const makerPortfolioId = trade.makers[0].portfolioId

                        await this.xact(
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

                this.orderEventPublisher.publishOrderEventFailedAsync(
                    exchangeOrder.portfolioId,
                    exchangeOrder.orderId,
                    reason,
                    'marketMaker',
                ) // async - don't wait to finish
            }

            throw error
        }
        return exchangeOrder
    }

    ////////////////////////////////////////////////////
    //  onFill
    //  - handle order fill resulting from trade
    ////////////////////////////////////////////////////

    private async onFill(taker: TakerFill) {
        const orderId = taker.orderId
        const portfolioId = taker.portfolioId
        const filledSize = taker.filledSize
        const filledValue = taker.filledValue
        const filledPrice = taker.filledPrice
        const makerRemaining = taker.sizeRemaining

        this.orderEventPublisher.publishOrderEventFillAsync(
            portfolioId,
            orderId,
            filledSize,
            filledValue,
            filledPrice,
            makerRemaining,
            'marketMaker',
        ) // async - don't wait to finish

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

        this.orderEventPublisher.publishOrderEventCompleteAsync(
            trade.taker.portfolioId,
            trade.taker.orderId,
            trade.tradeId,
            'marketMaker',
        ) // async - don't wait to finish
    }

    ////////////////////////////////////////////////////
    //  submitOrderToBook
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

    private async verifyAssetsAsync(exchangeOrder: ExchangeOrder) {
        // verify that portfolio exists.
        const orderPortfolioId = exchangeOrder.portfolioId
        const exchangeOrderPortfolio = await this.portfolioRepository.getDetailAsync(orderPortfolioId)
        if (!exchangeOrderPortfolio) {
            const msg = `Exchange Order Failed - input portfolioId not registered (${orderPortfolioId})`
            throw new ConflictError(msg, { exchangeOrder })
        }

        const portfolioId = exchangeOrder.portfolioId
        const assetId = exchangeOrder.assetId
        const unitsRequired = exchangeOrder.orderSide === 'ask' ? round4(exchangeOrder.orderSize) : 0

        if (unitsRequired > 0) {
            const portfolioHoldings = await this.portfolioHoldingRepository.getDetailAsync(portfolioId, assetId)
            const portfolioHoldingUnits = round4(portfolioHoldings?.units || 0)
            if (portfolioHoldingUnits < unitsRequired) {
                // exception
                const msg = ` portfolio: [${portfolioId}] asset holding: [${assetId}] has: [${portfolioHoldingUnits}] of required: [${unitsRequired}] `
                throw new InsufficientBalance(msg, { payload: exchangeOrder })
            }
        }
    }

    private async verifyFundsAsync(exchangeOrder: ExchangeOrder, price: number) {
        // verify that portfolio exists.
        const orderPortfolioId = exchangeOrder.portfolioId
        const exchangeOrderPortfolio = await this.portfolioRepository.getDetailAsync(orderPortfolioId)
        if (!exchangeOrderPortfolio) {
            const msg = `Exchange Order Failed - input portfolioId not registered (${orderPortfolioId})`
            throw new ConflictError(msg, { exchangeOrder })
        }

        const COIN_BUFFER_FACTOR = 1.05
        const portfolioId = exchangeOrder.portfolioId
        const paymentAssetId = 'coin::rkt'
        const coinsRequired =
            exchangeOrder.orderSide === 'bid' ? round4(exchangeOrder.orderSize * price) * COIN_BUFFER_FACTOR : 0

        if (coinsRequired > 0) {
            const coinsHeld = await this.portfolioHoldingRepository.getDetailAsync(portfolioId, paymentAssetId)
            const portfolioHoldingUnits = round4(coinsHeld?.units || 0)
            if (portfolioHoldingUnits < coinsRequired) {
                // exception
                const msg = ` portfolio: [${portfolioId}] coin holding: [${paymentAssetId}] has: [${portfolioHoldingUnits}] of required: [${coinsRequired}] `
                throw new InsufficientBalance(msg, { payload: exchangeOrder })
            }
        }
    }
}
