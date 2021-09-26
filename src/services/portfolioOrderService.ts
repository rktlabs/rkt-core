'use strict'

import * as log4js from 'log4js'
import { ExchangeService } from '.'
import {
    PortfolioOrderRepository,
    AssetRepository,
    PortfolioRepository,
    TransactionRepository,
    MarketMakerRepository,
    TNewPortfolioOrderProps,
    ConflictError,
    PortfolioOrder,
    TNewExchangeOrderConfig,
    TExchangeCancelOrder,
    TPortfolioOrderPatch,
    TPortfolioOrder,
} from '..'

const logger = log4js.getLogger()

export class PortfolioOrderService {
    private portfolioOrderRepository: PortfolioOrderRepository
    private assetRepository: AssetRepository
    private portfolioRepository: PortfolioRepository
    private exchangeService: ExchangeService

    constructor(
        assetRepository: AssetRepository,
        portfolioRepository: PortfolioRepository,
        transactionRepository: TransactionRepository,
        marketMakerRepository: MarketMakerRepository,
    ) {
        this.portfolioOrderRepository = new PortfolioOrderRepository()
        this.assetRepository = assetRepository
        this.portfolioRepository = portfolioRepository
        this.exchangeService = new ExchangeService(
            assetRepository,
            portfolioRepository,
            transactionRepository,
            marketMakerRepository,
            this.portfolioOrderRepository,
        )
    }

    async submitNewPortfolioOrderAsync(orderPayload: TNewPortfolioOrderProps) {
        // verify that asset exists.
        const orderAssetId = orderPayload.assetId
        const orderAsset = await this.assetRepository.getDetailAsync(orderAssetId)
        if (!orderAsset) {
            const msg = `Order Failed - input assetId not registered (${orderAssetId})`
            throw new ConflictError(msg, { payload: orderPayload })
        }

        // verify that portfolio exists.
        const portfolioId = orderPayload.portfolioId
        const orderPortfolio = await this.portfolioRepository.getDetailAsync(portfolioId)
        if (!orderPortfolio) {
            const msg = `Order Failed - input portfolioId not registered (${portfolioId})`
            throw new ConflictError(msg, { payload: orderPayload })
        }

        /////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////

        const newPortfolioOrder = PortfolioOrder.newOrder(orderPayload)
        await this.portfolioOrderRepository.storeAsync(portfolioId, newPortfolioOrder)

        const exchangeOrder: TNewExchangeOrderConfig = this._generateExchangeOrder(newPortfolioOrder)
        // if (this.eventPublisher) {
        //     await this.eventPublisher.publishExchangeOrderCreateAsync(exchangeOrder, 'orderHandler')
        // }

        await this.exchangeService.processNewExchangeOrderEvent(exchangeOrder)

        return newPortfolioOrder
    }

    async unwindOrder(portfolioId: string, orderId: string) {
        const order = await this.portfolioOrderRepository.getDetailAsync(portfolioId, orderId)
        if (!order) {
            const msg = `Order Failed - could not find order (${portfolioId}/${orderId})`
            throw new ConflictError(msg)
        }

        /////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////
        const orderPayload: TNewPortfolioOrderProps = {
            assetId: order.assetId,
            portfolioId: order.portfolioId,
            orderSide: order.orderSide === 'bid' ? 'ask' : 'bid',
            orderSize: order.orderSize,
            orderType: 'market',
            xids: {
                refOrderId: orderId,
                portfolioId: portfolioId,
            },
        }

        const newOrder = PortfolioOrder.newOrder(orderPayload)
        await this.portfolioOrderRepository.storeAsync(portfolioId, newOrder)

        const exchangeOrder: TNewExchangeOrderConfig = this._generateExchangeOrder(newOrder)
        // if (this.eventPublisher) {
        //     await this.eventPublisher.publishExchangeOrderCreateAsync(exchangeOrder, 'orderHandler')
        // }

        return newOrder
    }

    // TODO: Rework Cancel Order
    async cancelOrder(portfolioId: string, orderId: string) {
        const order = await this.portfolioOrderRepository.getDetailAsync(portfolioId, orderId)
        // if (order) {
        //     const exchangeOrder: TExchangeCancelOrder = this._generateCancelExchangeOrder(order)

        //     // update state to 'cancelPending'
        //     const patch: TPortfolioOrderPatch = { status: 'cancelPending' }
        //     const updatedOrder = await this.portfolioOrderRepository.updateAsync(portfolioId, orderId, patch)

        //     return updatedOrder
        // } else {
        return order
        // }
    }

    ////////////////////////////////////////////////////////
    // PRIVATE
    ////////////////////////////////////////////////////////

    private _generateExchangeOrder = (order: TPortfolioOrder) => {
        const exchangeOrder: TNewExchangeOrderConfig = {
            operation: 'order',
            orderType: order.orderType,
            orderId: order.orderId,
            portfolioId: order.portfolioId,
            assetId: order.assetId,
            orderSide: order.orderSide,
            orderSize: order.orderSize,
        }

        if (order.orderType === 'limit') {
            exchangeOrder.orderPrice = order.orderPrice
        }

        return exchangeOrder
    }

    private _generateCancelExchangeOrder(order: TPortfolioOrder) {
        const exchangeOrder: TExchangeCancelOrder = {
            operation: 'cancel',
            assetId: order.assetId,
            portfolioId: order.portfolioId,
            orderId: order.orderId,
            refOrderId: order.orderId,
        }
        return exchangeOrder
    }
}
