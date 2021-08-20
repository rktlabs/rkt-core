import { PortfolioCache, AssetCache } from '../caches'
import { OrderRepository } from '../repositories'
import {
    Order,
    TExchangeCancelOrder as TCancelExchangeOrder,
    TNewExchangeOrder,
    TNewOrderProps,
    TOrder,
    TOrderPatch,
} from '../models'
import { ConflictError } from '../errors'
import { EventPublisher, IEventPublisher } from '../services'

export class OrderService {
    private db: FirebaseFirestore.Firestore
    private eventPublisher: IEventPublisher

    private portfolioCache: PortfolioCache
    private assetCache: AssetCache
    private orderRepository: OrderRepository

    constructor(db: FirebaseFirestore.Firestore, eventPublisher?: IEventPublisher) {
        this.db = db
        this.eventPublisher = eventPublisher || new EventPublisher()

        this.portfolioCache = new PortfolioCache(db)
        this.assetCache = new AssetCache(db)
        this.orderRepository = new OrderRepository(db)
    }

    async newOrder(orderPayload: TNewOrderProps) {
        // verify that asset exists.
        const orderAssetId = orderPayload.assetId
        const orderAsset = await this.assetCache.lookupAsset(orderAssetId)
        if (!orderAsset) {
            const msg = `Order Failed - input assetId not registered (${orderAssetId})`
            throw new ConflictError(msg, { payload: orderPayload })
        }

        // verify that portfolio exists.
        const portfolioId = orderPayload.portfolioId
        const orderPortfolio = await this.portfolioCache.lookupPortfolio(portfolioId)
        if (!orderPortfolio) {
            const msg = `Order Failed - input portfolioId not registered (${portfolioId})`
            throw new ConflictError(msg, { payload: orderPayload })
        }

        /////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////

        const newOrder = Order.newOrder(orderPayload)
        await this.orderRepository.storePortfolioOrder(portfolioId, newOrder)

        const exchangeOrder: TNewExchangeOrder = this.generateExchangeOrder(newOrder)
        if (this.eventPublisher) {
            await this.eventPublisher.publishExchangeOrderCreateAsync(exchangeOrder, 'orderHandler')
        }

        return newOrder
    }

    async unwindOrder(portfolioId: string, orderId: string) {
        const order = await this.orderRepository.getPortfolioOrder(portfolioId, orderId)
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

        const newOrder = Order.newOrder(orderPayload)
        await this.orderRepository.storePortfolioOrder(portfolioId, newOrder)

        const exchangeOrder: TNewExchangeOrder = this.generateExchangeOrder(newOrder)
        if (this.eventPublisher) {
            await this.eventPublisher.publishExchangeOrderCreateAsync(exchangeOrder, 'orderHandler')
        }

        return newOrder
    }

    async cancelOrder(portfolioId: string, orderId: string) {
        const order = await this.orderRepository.getPortfolioOrder(portfolioId, orderId)
        if (order) {
            const exchangeOrder: TCancelExchangeOrder = this.generateCancelExchangeOrder(order)
            if (this.eventPublisher) {
                await this.eventPublisher.publishExchangeOrderCancelAsync(exchangeOrder, 'orders')
            }

            // update state to 'cancelPending'
            const patch: TOrderPatch = { status: 'cancelPending' }
            const updatedOrder = await this.orderRepository.updatePortfolioOrder(portfolioId, orderId, patch)

            return updatedOrder
        } else {
            return undefined
        }
    }

    ///////////////////////////////////////////
    // Private Methods
    ///////////////////////////////////////////

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
        const exchangeOrder: TCancelExchangeOrder = {
            operation: 'cancel',
            assetId: order.assetId,
            portfolioId: order.portfolioId,
            orderId: order.orderId,
            refOrderId: order.orderId,
        }
        return exchangeOrder
    }
}
