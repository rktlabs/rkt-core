'use strict'

import * as log4js from 'log4js'
import { DateTime } from 'luxon'
import { PortfolioOrderEventService, ExchangeService } from '.'
import {
    PortfolioOrderRepository,
    AssetRepository,
    PortfolioRepository,
    TransactionRepository,
    MarketMakerRepository,
    TExchangeOrderFill,
    ConflictError,
    PortfolioOrder,
    TOrderSource,
    TExchangeOrderComplete,
    TExchangeOrder,
} from '..'

const logger = log4js.getLogger('PortfolioOrderService')

export class PortfolioOrderService {
    private portfolioOrderRepository: PortfolioOrderRepository
    private assetRepository: AssetRepository
    private portfolioRepository: PortfolioRepository
    private portfolioOrderEventService: PortfolioOrderEventService

    private exchangeService: ExchangeService

    constructor(
        assetRepository: AssetRepository,
        portfolioRepository: PortfolioRepository,
        transactionRepository: TransactionRepository,
        marketMakerRepository: MarketMakerRepository,
        portfolioOrderRepository: PortfolioOrderRepository,
    ) {
        this.portfolioOrderRepository = portfolioOrderRepository
        this.assetRepository = assetRepository
        this.portfolioRepository = portfolioRepository
        this.portfolioOrderEventService = new PortfolioOrderEventService(portfolioOrderRepository)

        this.exchangeService = new ExchangeService(
            assetRepository,
            portfolioRepository,
            transactionRepository,
            marketMakerRepository,
        )

        this.exchangeService.on('orderExecution', (event: TExchangeOrderFill) => {
            this._onOrderExecution(event)
        })

        this.exchangeService.on('orderFail', (order: TExchangeOrder) => {
            this._onOrderFail(order)
        })
    }

    async submitNewPortfolioOrderAsync(portfolioId: string, orderPayload: TOrderSource) {
        // verify that asset exists.
        const orderAssetId = orderPayload.assetId
        const orderAsset = await this.assetRepository.getDetailAsync(orderAssetId)
        if (!orderAsset) {
            const msg = `Order Failed - input assetId not registered (${orderAssetId})`
            logger.error(msg)
            throw new ConflictError(msg, { payload: orderPayload })
        }

        // verify that portfolio exists.
        const orderPortfolio = await this.portfolioRepository.getDetailAsync(portfolioId)
        if (!orderPortfolio) {
            const msg = `Order Failed - input portfolioId not registered (${portfolioId})`
            logger.error(msg)
            throw new ConflictError(msg, { payload: orderPayload })
        }

        /////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////

        const newPortfolioOrder = PortfolioOrder.newOrder(orderPayload)
        await this.portfolioOrderRepository.storeAsync(portfolioId, newPortfolioOrder)

        const orderSource: TOrderSource = newPortfolioOrder.orderSource
        // if (this.eventPublisher) {
        //     await this.eventPublisher.publishExchangeOrderCreateAsync(exchangeOrder, 'orderHandler')
        // }

        await this.exchangeService.processOrder(orderSource)

        return newPortfolioOrder
    }

    private async _onOrderExecution(event: TExchangeOrderFill) {
        this.portfolioOrderEventService.processFillEvent(event)

        if (event.sizeRemaining == 0) {
            const completeEvent: TExchangeOrderComplete = {
                eventType: 'orderComplete',
                publishedAt: DateTime.utc().toString(),
                orderId: event.orderId,
                portfolioId: event.portfolioId,
            }
            await this.portfolioOrderEventService.processCompleteEvent(completeEvent)
        }
    }

    private async _onOrderFail(order: TExchangeOrder) {
        logger.error('OrederFailed', order)

        this.portfolioOrderEventService.processFailEvent(order)
    }

    // async unwindOrder(portfolioId: string, orderId: string) {
    //     const order = await this.portfolioOrderRepository.getDetailAsync(portfolioId, orderId)
    //     if (!order) {
    //         const msg = `Order Failed - could not find order (${portfolioId}/${orderId})`
    //         logger.error(msg)
    //         throw new ConflictError(msg)
    //     }

    //     /////////////////////////////////////////////////////////
    //     /////////////////////////////////////////////////////////
    //     const orderPayload: TNewPortfolioOrderConfig = {
    //         assetId: order.assetId,
    //         orderSide: order.orderSide === 'bid' ? 'ask' : 'bid',
    //         orderSize: order.orderSize,
    //         orderType: 'market',
    //         xids: {
    //             portfolioId: portfolioId,
    //         },
    //     }

    //     const newOrder = PortfolioOrder.newOrder(orderPayload)
    //     await this.portfolioOrderRepository.storeAsync(portfolioId, newOrder)

    //     const exchangeOrder: TOrderSource = this._generateExchangeOrder(portfolioId, newOrder)
    //     // if (this.eventPublisher) {
    //     //     await this.eventPublisher.publishExchangeOrderCreateAsync(exchangeOrder, 'orderHandler')
    //     // }

    //     return newOrder
    // }

    // TODO: Rework Cancel Order
    // async cancelOrder(portfolioId: string, orderId: string) {
    //     const order = await this.portfolioOrderRepository.getDetailAsync(portfolioId, orderId)
    //     return order
    // }

    ////////////////////////////////////////////////////////
    // PRIVATE
    ////////////////////////////////////////////////////////

    // private _generateCancelExchangeOrder(portfolioId: string, order: TPortfolioOrder) {
    //     const exchangeOrder: TExchangeCancelOrder = {
    //         operation: 'cancel',
    //         portfolioId: portfolioId,
    //         orderId: order.orderId,
    //     }
    //     return exchangeOrder
    // }
}
