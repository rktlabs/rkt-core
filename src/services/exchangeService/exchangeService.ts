'use strict'

import * as log4js from 'log4js'
import { DateTime } from 'luxon'
const logger = log4js.getLogger()

import { MarketOrder, OrderSide, Trade, TQuote, TakerFillEvent, MakerFill, TakerFill } from '.'

import {
    AssetRepository,
    ExchangeOrderRepository,
    ExchangeTradeRepository,
    TNewExchangeOrder,
    ExchangeOrder,
    TAssetUpdate,
    round4,
    ConflictError,
    InsufficientBalance,
    LeagueRepository,
    NotFoundError,
    EventPublisher,
    TransactionService,
    PortfolioHoldingsRepository,
    PortfolioRepository,
    MakerServiceFactory,
} from '../..'

export class ExchangeService {
    private eventPublisher: EventPublisher

    private assetRepository: AssetRepository
    private leagueRepository: LeagueRepository
    private portfolioHoldingsCache: PortfolioHoldingsRepository
    private portfolioCache: PortfolioRepository
    private exchangeOrderRepository: ExchangeOrderRepository
    private exchangeTradeRepository: ExchangeTradeRepository
    private transactionService: TransactionService
    private makerService: MakerServiceFactory

    constructor(eventPublisher?: EventPublisher) {
        this.eventPublisher = eventPublisher || new EventPublisher()

        this.assetRepository = new AssetRepository()
        this.leagueRepository = new LeagueRepository()
        this.portfolioHoldingsCache = new PortfolioHoldingsRepository()
        this.portfolioCache = new PortfolioRepository()

        this.exchangeOrderRepository = new ExchangeOrderRepository()
        this.exchangeTradeRepository = new ExchangeTradeRepository()

        this.transactionService = new TransactionService()

        this.makerService = new MakerServiceFactory()
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

            ////////////////////////////
            // verify that asset exists
            ////////////////////////////
            const assetId = exchangeOrder.assetId
            const asset = await this.assetRepository.getDetailAsync(assetId)
            if (!asset) {
                const msg = `Invalid Order: Asset: ${assetId} does not exist`
                throw new NotFoundError(msg, { assetId })
            }

            ////////////////////////////
            // verify that league exists - not sure why it matters. should always be true
            ////////////////////////////
            const leagueId = asset.leagueId
            const league = await this.leagueRepository.getDetailAsync(leagueId)
            if (!league) {
                const msg = `Invalid Order: League: ${leagueId} does not exist`
                throw new NotFoundError(msg, { leagueId })
            }

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
                const price = asset?.bid || 0
                await this.verifyFundsAsync(exchangeOrder, price)
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
            const makerPortfolioId = league.portfolioId
            //const trade = await this.processOrder(order, makerPortfolioId)

            ///////////////////////////////////////////////////
            // create trade and fill in maker from asset pools
            const trade = new Trade(order)
            const taker = trade.taker

            // for bid (a buy) I'm "removing" units from the pool, so flip sign
            const signedTakeSize = trade.taker.orderSide === 'ask' ? taker.orderSize * -1 : taker.orderSize

            // console.log('------------- ORDER -------------')
            // console.log(order)
            // console.log(trade)
            // console.log(`signedTakeSize: ${signedTakeSize}`)

            //const assetId = order.assetId
            const taken = await this.makerService.takeUnits(assetId, signedTakeSize)
            if (!taken) {
                return null
            }
            // console.log('------------- taken -------------')
            // console.log(taken)

            const { bid, ask, makerDeltaUnits: makerDeltaUnits, makerDeltaCoins: makerDeltaCoins } = taken

            const makerFill = new MakerFill({
                assetId: taker.assetId,
                portfolioId: makerPortfolioId,
                orderSide: taker.orderSide === 'bid' ? 'ask' : 'bid', // flip side from taker
                orderSize: taker.orderSize,
            })

            trade.fillMaker(makerFill, makerDeltaUnits, makerDeltaCoins)

            if (trade.taker.filledSize !== 0) {
                await this.onFill(trade.taker)
                await this.onTrade(trade)
                await this.onUpdateQuote(trade, bid, ask)
            }

            if (trade) {
                const makerPortfolioId = league.portfolioId

                if (trade.taker.filledSize) {
                    const takerPortfolioId = trade.taker.portfolioId
                    const takerDeltaUnits = trade.taker.filledSize
                    const takerDeltaValue = trade.taker.filledValue
                    await this.xact(
                        orderId,
                        assetId,
                        trade.tradeId,
                        takerPortfolioId,
                        takerDeltaUnits,
                        takerDeltaValue,
                        makerPortfolioId,
                    )
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

                this.eventPublisher.publishOrderEventFailedAsync(
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

    private async processOrder(order: MarketOrder, makerPortfolioId: string) {
        ///////////////////////////////////////////////////
        // create trade and fill in maker from asset pools
        const trade = new Trade(order)
        const taker = trade.taker

        // for bid (a buy) I'm "removing" units from the pool, so flip sign
        const signedTakeSize = trade.taker.orderSide === 'ask' ? taker.orderSize * -1 : taker.orderSize

        const assetId = order.assetId
        const taken = await this.makerService.takeUnits(assetId, signedTakeSize)
        if (!taken) {
            return null
        }

        const { bid, ask, makerDeltaUnits, makerDeltaCoins } = taken

        const makerFill = new MakerFill({
            assetId: taker.assetId,
            portfolioId: makerPortfolioId,
            orderSide: taker.orderSide === 'bid' ? 'ask' : 'bid', // flip side from taker
            orderSize: taker.orderSize,
        })

        trade.fillMaker(makerFill, makerDeltaUnits, makerDeltaCoins)

        if (trade.taker.filledSize !== 0) {
            await this.onFill(trade.taker)
            await this.onTrade(trade)
            await this.onUpdateQuote(trade, bid, ask)
        }

        return trade
    }

    ////////////////////////////////////////////////////
    //  onFill
    //  - handle order fill resulting from trade
    ////////////////////////////////////////////////////
    private async onFill(taker: TakerFill) {
        const event: TakerFillEvent = {
            assetId: taker.assetId,
            orderId: taker.orderId,
            portfolioId: taker.portfolioId,
            orderType: taker.orderType,
            orderSide: taker.orderSide,
            orderSize: taker.orderSize,
            sizeRemaining: taker.sizeRemaining,
            tags: taker.tags,
            filledSize: taker.filledSize,
            filledValue: taker.filledValue,
            filledPrice: taker.filledPrice,
            isPartial: taker.isPartial,
            isClosed: taker.isClosed,
        }

        //logger.debug('onFill: %o', event)
        const orderId = event.orderId
        const portfolioId = event.portfolioId

        const filledSize = event.filledSize
        const filledValue = event.filledValue
        const filledPrice = event.filledPrice
        const makerRemaining = event.sizeRemaining

        this.eventPublisher.publishOrderEventFillAsync(
            portfolioId,
            orderId,
            filledSize,
            filledValue,
            filledPrice,
            makerRemaining,
            'marketMaker',
        ) // async - don't wait to finish

        const newMakerStatus = event.isClosed ? 'filled' : 'partial'
        const newMakerState = !event.isClosed && event.sizeRemaining > 0 ? 'open' : 'closed'

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
        // logger.debug('onTrade: %o', trade)
        await this.exchangeTradeRepository.storeAsync(trade) // async - don't wait to finish

        this.eventPublisher.publishOrderEventCompleteAsync(
            trade.taker.portfolioId,
            trade.taker.orderId,
            trade.tradeId,
            'marketMaker',
        ) // async - don't wait to finish
    }

    ////////////////////////////////////////////////////
    //  onUpdateQuote
    //  - store new quoted for the asset indicated
    ////////////////////////////////////////////////////
    private onUpdateQuote = async (trade: Trade, bid: number, ask: number) => {
        const timeAtNow = DateTime.utc().toString()
        const event: TQuote = {
            assetId: trade.assetId,
            quoteAt: timeAtNow,
            bid,
            ask,
            lastTrade: {
                side: trade.taker.orderSide,
                volume: Math.abs(trade.taker.filledSize),
                price: trade.taker.filledPrice,
                executedAt: trade.executedAt,
            },
        }
        //logger.debug('onUpdateQuote: %o', event)

        const assetId = event.assetId
        // const bid = event.bid
        // const ask = event.ask
        const last = event.lastTrade?.price || 0

        const updateProps: TAssetUpdate = { bid, ask, last }
        await this.assetRepository.updateAsync(assetId, updateProps)
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

        // console.log(`takerPortfolioId: ${takerPortfolioId} `)
        // console.log(`takerDeltaUnits: ${takerDeltaUnits} `)
        // console.log(`takerDeltaValue: ${takerDeltaValue} `)
        // console.log(`makerPortfolioId: ${makerPortfolioId} `)

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
                        assetId: 'coin::fantx',
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
                        assetId: 'coin::fantx',
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
            // takerDeltaUnits < 0 ( an ask/sale )
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
                        assetId: 'coin::fantx',
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
                        assetId: 'coin::fantx',
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

        // logger.debug('Transaction: ', newTransactionData)

        return this.transactionService.newTransactionAsync(newTransactionData)
    }

    private async verifyAssetsAsync(exchangeOrder: ExchangeOrder) {
        // verify that portfolio exists.
        const orderPortfolioId = exchangeOrder.portfolioId
        const exchangeOrderPortfolio = await this.portfolioCache.getDetailAsync(orderPortfolioId)
        if (!exchangeOrderPortfolio) {
            const msg = `Exchange Order Failed - input portfolioId not registered (${orderPortfolioId})`
            throw new ConflictError(msg, { exchangeOrder })
        }

        const portfolioId = exchangeOrder.portfolioId
        const assetId = exchangeOrder.assetId
        const unitsRequired = exchangeOrder.orderSide === 'ask' ? round4(exchangeOrder.orderSize) : 0

        if (unitsRequired > 0) {
            const portfolioHoldings = await this.portfolioHoldingsCache.getDetailAsync(portfolioId, assetId)
            const portfolioHoldingsUnits = round4(portfolioHoldings?.units || 0)
            if (portfolioHoldingsUnits < unitsRequired) {
                // exception
                const msg = ` portfolio: [${portfolioId}] asset holding: [${assetId}] has: [${portfolioHoldingsUnits}] of required: [${unitsRequired}] `
                throw new InsufficientBalance(msg, { payload: exchangeOrder })
            }
        }
    }

    private async verifyFundsAsync(exchangeOrder: ExchangeOrder, price: number) {
        // verify that portfolio exists.
        const orderPortfolioId = exchangeOrder.portfolioId
        const exchangeOrderPortfolio = await this.portfolioCache.getDetailAsync(orderPortfolioId)
        if (!exchangeOrderPortfolio) {
            const msg = `Exchange Order Failed - input portfolioId not registered (${orderPortfolioId})`
            throw new ConflictError(msg, { exchangeOrder })
        }

        const COIN_BUFFER_FACTOR = 1.05
        const portfolioId = exchangeOrder.portfolioId
        const paymentAssetId = 'coin::fantx'
        const coinsRequired =
            exchangeOrder.orderSide === 'bid' ? round4(exchangeOrder.orderSize * price) * COIN_BUFFER_FACTOR : 0

        if (coinsRequired > 0) {
            const coinsHeld = await this.portfolioHoldingsCache.getDetailAsync(portfolioId, paymentAssetId)
            const portfolioHoldingsUnits = round4(coinsHeld?.units || 0)
            if (portfolioHoldingsUnits < coinsRequired) {
                // exception
                const msg = ` portfolio: [${portfolioId}] coin holding: [${paymentAssetId}] has: [${portfolioHoldingsUnits}] of required: [${coinsRequired}] `
                throw new InsufficientBalance(msg, { payload: exchangeOrder })
            }
        }
    }
}
