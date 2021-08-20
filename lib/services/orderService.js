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
const caches_1 = require("../caches");
const repositories_1 = require("../repositories");
const models_1 = require("../models");
const errors_1 = require("../errors");
const services_1 = require("../services");
class OrderService {
    constructor(db, eventPublisher) {
        ///////////////////////////////////////////
        // Private Methods
        ///////////////////////////////////////////
        this.generateExchangeOrder = (order) => {
            const exchangeOrder = {
                operation: 'order',
                orderType: order.orderType,
                orderId: order.orderId,
                portfolioId: order.portfolioId,
                assetId: order.assetId,
                orderSide: order.orderSide,
                orderSize: order.orderSize,
            };
            if (order.orderType === 'limit') {
                exchangeOrder.orderPrice = order.orderPrice;
            }
            return exchangeOrder;
        };
        this.db = db;
        this.eventPublisher = eventPublisher || new services_1.EventPublisher();
        this.portfolioCache = new caches_1.PortfolioCache(db);
        this.assetCache = new caches_1.AssetCache(db);
        this.orderRepository = new repositories_1.OrderRepository(db);
    }
    newOrder(orderPayload) {
        return __awaiter(this, void 0, void 0, function* () {
            // verify that asset exists.
            const orderAssetId = orderPayload.assetId;
            const orderAsset = yield this.assetCache.lookupAsset(orderAssetId);
            if (!orderAsset) {
                const msg = `Order Failed - input assetId not registered (${orderAssetId})`;
                throw new errors_1.ConflictError(msg, { payload: orderPayload });
            }
            // verify that portfolio exists.
            const portfolioId = orderPayload.portfolioId;
            const orderPortfolio = yield this.portfolioCache.lookupPortfolio(portfolioId);
            if (!orderPortfolio) {
                const msg = `Order Failed - input portfolioId not registered (${portfolioId})`;
                throw new errors_1.ConflictError(msg, { payload: orderPayload });
            }
            /////////////////////////////////////////////////////////
            /////////////////////////////////////////////////////////
            const newOrder = models_1.Order.newOrder(orderPayload);
            yield this.orderRepository.storePortfolioOrder(portfolioId, newOrder);
            const exchangeOrder = this.generateExchangeOrder(newOrder);
            if (this.eventPublisher) {
                yield this.eventPublisher.publishExchangeOrderCreateAsync(exchangeOrder, 'orderHandler');
            }
            return newOrder;
        });
    }
    unwindOrder(portfolioId, orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            const order = yield this.orderRepository.getPortfolioOrder(portfolioId, orderId);
            if (!order) {
                const msg = `Order Failed - could not find order (${portfolioId}/${orderId})`;
                throw new errors_1.ConflictError(msg);
            }
            /////////////////////////////////////////////////////////
            /////////////////////////////////////////////////////////
            const orderPayload = {
                assetId: order.assetId,
                portfolioId: order.portfolioId,
                orderSide: order.orderSide === 'bid' ? 'ask' : 'bid',
                orderSize: order.orderSize,
                orderType: 'market',
                xids: {
                    refOrderId: orderId,
                    portfolioId: portfolioId,
                },
            };
            const newOrder = models_1.Order.newOrder(orderPayload);
            yield this.orderRepository.storePortfolioOrder(portfolioId, newOrder);
            const exchangeOrder = this.generateExchangeOrder(newOrder);
            if (this.eventPublisher) {
                yield this.eventPublisher.publishExchangeOrderCreateAsync(exchangeOrder, 'orderHandler');
            }
            return newOrder;
        });
    }
    cancelOrder(portfolioId, orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            const order = yield this.orderRepository.getPortfolioOrder(portfolioId, orderId);
            if (order) {
                const exchangeOrder = this.generateCancelExchangeOrder(order);
                if (this.eventPublisher) {
                    yield this.eventPublisher.publishExchangeOrderCancelAsync(exchangeOrder, 'orders');
                }
                // update state to 'cancelPending'
                const patch = { status: 'cancelPending' };
                const updatedOrder = yield this.orderRepository.updatePortfolioOrder(portfolioId, orderId, patch);
                return updatedOrder;
            }
            else {
                return undefined;
            }
        });
    }
    generateCancelExchangeOrder(order) {
        const exchangeOrder = {
            operation: 'cancel',
            assetId: order.assetId,
            portfolioId: order.portfolioId,
            orderId: order.orderId,
            refOrderId: order.orderId,
        };
        return exchangeOrder;
    }
}
exports.OrderService = OrderService;
