"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
class OrderService {
    //  private orderRepository: PortfolioOrdersRepository
    constructor() {
        // this.orderRepository = new PortfolioOrdersRepository(db)
    }
    newOrder(orderPayload) {
        return __awaiter(this, void 0, void 0, function* () {
            // // verify that asset exists.
            // const orderAssetId = orderPayload.assetId
            // const orderAsset = await this.assetCache.lookupAsset(orderAssetId)
            // if (!orderAsset) {
            //     const msg = `Order Failed - input assetId not registered (${orderAssetId})`
            //     throw new ConflictError(msg, { payload: orderPayload })
            // }
            // // verify that portfolio exists.
            // const portfolioId = orderPayload.portfolioId
            // const orderPortfolio = await this.portfolioCache.lookupPortfolio(portfolioId)
            // if (!orderPortfolio) {
            //     const msg = `Order Failed - input portfolioId not registered (${portfolioId})`
            //     throw new ConflictError(msg, { payload: orderPayload })
            // }
            // /////////////////////////////////////////////////////////
            // /////////////////////////////////////////////////////////
            // const newOrder = Order.newOrder(orderPayload)
            // await this.orderRepository.storePortfolioOrder(portfolioId, newOrder)
            // const exchangeOrder: TNewExchangeOrder = this.generateExchangeOrder(newOrder)
            const newOrder = orderPayload;
            return newOrder;
        });
    }
    // async unwindOrder(portfolioId: string, orderId: string) {
    //     const order = await this.orderRepository.getPortfolioOrder(portfolioId, orderId)
    //     if (!order) {
    //         const msg = `Order Failed - could not find order (${portfolioId}/${orderId})`
    //         throw new ConflictError(msg)
    //     }
    //     /////////////////////////////////////////////////////////
    //     /////////////////////////////////////////////////////////
    //     const orderPayload: TNewOrderProps = {
    //         assetId: order.assetId,
    //         portfolioId: order.portfolioId,
    //         orderSide: order.orderSide === 'bid' ? 'ask' : 'bid',
    //         orderSize: order.orderSize,
    //         orderType: 'market',
    //         xids: {
    //             refOrderId: orderId,
    //             portfolioId: portfolioId,
    //         },
    //     }
    //     const newOrder = Order.newOrder(orderPayload)
    //     await this.orderRepository.storePortfolioOrder(portfolioId, newOrder)
    //     const exchangeOrder: TNewExchangeOrder = this.generateExchangeOrder(newOrder)
    //     if (this.eventPublisher) {
    //         await this.eventPublisher.publishExchangeOrderCreateAsync(exchangeOrder, 'orderHandler')
    //     }
    //     return newOrder
    // }
    cancelOrder(portfolioId, orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            // const order = await this.orderRepository.getPortfolioOrder(portfolioId, orderId)
            // if (order) {
            //     const exchangeOrder: TCancelExchangeOrder = this.generateCancelExchangeOrder(order)
            //     // update state to 'cancelPending'
            //     const patch: TOrderPatch = { status: 'cancelPending' }
            //     const updatedOrder = await this.orderRepository.updatePortfolioOrder(portfolioId, orderId, patch)
            //     return updatedOrder
            // } else {
            //     return undefined
            // }
            const updatedOrder = {
                portfolioId: portfolioId,
                orderId: orderId,
            };
            return updatedOrder;
        });
    }
}
exports.OrderService = OrderService;
