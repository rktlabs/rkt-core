'use strict'

import * as log4js from 'log4js'
import { DateTime } from 'luxon'
const logger = log4js.getLogger()

import { MakerTrade, TakerOrder, OrderSide, TakerFill } from '.'

import {
    ExchangeOrderRepository,
    ExchangeTradeRepository,
    TNewExchangeOrderConfig,
    ExchangeOrder,
    round4,
    ConflictError,
    InsufficientBalance,
    TransactionService,
    PortfolioRepository,
    MakerService,
    ExchangeQuoteRepository,
    NullEventPublisher,
    IEventPublisher,
    AssetHolderRepository,
} from '../..'

///////////////////////////////////////////////////
// Exchnage Service
// - recieves orders
// - resolves markerMakr for asset in order
// - applies order to markerMaker
// - emits order events as order is processecd
// - applies transaction returned from market maker?

export class ExchangeService {
    private orderEventPublisher: IEventPublisher

    private portfolioRepository: PortfolioRepository
    private assetHolderRepository: AssetHolderRepository
    private exchangeOrderRepository: ExchangeOrderRepository
    private exchangeTradeRepository: ExchangeTradeRepository
    private exchangeQuoteRepository: ExchangeQuoteRepository
    private transactionService: TransactionService
    private makerService: MakerService

    constructor(eventPublisher?: IEventPublisher) {
        this.orderEventPublisher = eventPublisher || new NullEventPublisher()

        this.assetHolderRepository = new AssetHolderRepository()
        this.portfolioRepository = new PortfolioRepository()

        this.exchangeOrderRepository = new ExchangeOrderRepository()
        this.exchangeTradeRepository = new ExchangeTradeRepository()
        this.exchangeQuoteRepository = new ExchangeQuoteRepository()

        this.transactionService = new TransactionService()
        this.makerService = new MakerService()
    }

    ////////////////////////////////////////////////////
    //  handleNewExchangeOrderAsync
    //  - new order handler - accepts raw json as input
    ////////////////////////////////////////////////////
    async processNewExchangeOrderAsync(orderPayload: TNewExchangeOrderConfig) {
        logger.debug(`Handle Exchange Order: ${JSON.stringify(orderPayload)}`)

        let exchangeOrder: ExchangeOrder | undefined
        try {
            ////////////////////////////////////
            // Verify source portfolio has adequate funds/units to complete transaction
            ////////////////////////////////////
            const portfolioId = orderPayload.portfolioId
            const assetId = orderPayload.assetId
            const orderSide = orderPayload.orderSide
            const orderSize = orderPayload.orderSize

            if (orderSide === 'bid') {
                await this.verifyAssetsAsync(portfolioId, assetId, orderSide, orderSize)
            } else if (orderSide === 'ask') {
                await this.verifyFundsAsync(portfolioId, assetId, orderSide, orderSize)
            }

            ////////////////////////////////////
            // order is reasonably complete so mark it as received
            // and STORE it
            ////////////////////////////////////
            exchangeOrder = ExchangeOrder.newExchangeOrder(orderPayload)
            exchangeOrder.status = 'received'
            await this.exchangeOrderRepository.storeAsync(exchangeOrder)

            // verify that maker exists.
            const orderId = exchangeOrder.orderId

            const order = new TakerOrder({
                assetId: assetId,
                orderId: orderId,
                portfolioId: portfolioId,
                orderSide: orderSide as OrderSide,
                orderSize: orderSize,
            })

            ////////////////////////////////////////////////////////
            // Process the order
            ////////////////////////////////////////////////////////

            const maker = await this.makerService.getMakerAsync(assetId)
            if (maker) {
                const trade = await maker.processTakerOrder(order)

                if (trade) {
                    if (trade.taker.filledSize) {
                        await this.onFill(trade.taker)
                        await this.onTrade(trade)

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

    ////////////////////////////////////////////////////////
    // PRIVATE
    ////////////////////////////////////////////////////////

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
    private onTrade = async (trade: MakerTrade) => {
        await this.exchangeTradeRepository.storeAsync(trade) // async - don't wait to finish

        this.orderEventPublisher.publishOrderEventCompleteAsync(
            trade.taker.portfolioId,
            trade.taker.orderId,
            trade.tradeId,
            'marketMaker',
        ) // async - don't wait to finish
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
