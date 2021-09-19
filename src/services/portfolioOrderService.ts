import {
    AssetRepository,
    ConflictError,
    PortfolioOrderRepository,
    PortfolioRepository,
    TExchangeCancelOrder,
    TNewExchangeOrder,
} from '..'
import { PortfolioOrder, TNewOrderProps, TOrder, TOrderPatch } from '../models/portfolioOrder'

export class PortfolioOrderService {
    private orderRepository: PortfolioOrderRepository
    private assetRepository: AssetRepository
    private portfolioRepository: PortfolioRepository

    constructor() {
        this.orderRepository = new PortfolioOrderRepository()
        this.assetRepository = new AssetRepository()
        this.portfolioRepository = new PortfolioRepository()
    }

    async createOrder(orderPayload: TNewOrderProps) {
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

        const newOrder = PortfolioOrder.newOrder(orderPayload)
        await this.orderRepository.storeAsync(portfolioId, newOrder)

        const exchangeOrder: TNewExchangeOrder = this.generateExchangeOrder(newOrder)

        return newOrder
    }

    async unwindOrder(portfolioId: string, orderId: string) {
        const order = await this.orderRepository.getDetailAsync(portfolioId, orderId)
        if (!order) {
            const msg = `Order Failed - could not find order (${portfolioId}/${orderId})`
            throw new ConflictError(msg)
        }

        /////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////
        const orderPayload: TNewOrderProps = {
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
        await this.orderRepository.storeAsync(portfolioId, newOrder)

        const exchangeOrder: TNewExchangeOrder = this.generateExchangeOrder(newOrder)
        // if (this.eventPublisher) {
        //     await this.eventPublisher.publishExchangeOrderCreateAsync(exchangeOrder, 'orderHandler')
        // }

        return newOrder
    }

    async cancelOrder(portfolioId: string, orderId: string) {
        const order = await this.orderRepository.getDetailAsync(portfolioId, orderId)
        if (order) {
            const exchangeOrder: TExchangeCancelOrder = this.generateCancelExchangeOrder(order)

            // update state to 'cancelPending'
            const patch: TOrderPatch = { status: 'cancelPending' }
            const updatedOrder = await this.orderRepository.updateAsync(portfolioId, orderId, patch)

            return updatedOrder
        } else {
            return undefined
        }
    }

    ////////////////////////////////////////////////////////
    // PRIVATE
    ////////////////////////////////////////////////////////

    private generateExchangeOrder = (order: TOrder) => {
        const exchangeOrder: TNewExchangeOrder = {
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

    private generateCancelExchangeOrder(order: TOrder) {
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
