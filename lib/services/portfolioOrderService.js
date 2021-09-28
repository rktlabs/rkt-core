'use strict';
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
exports.PortfolioOrderService = void 0;
const log4js = require("log4js");
const luxon_1 = require("luxon");
const _1 = require(".");
const __1 = require("..");
const logger = log4js.getLogger();
class PortfolioOrderService {
    constructor(assetRepository, portfolioRepository, transactionRepository, marketMakerRepository, portfolioOrderRepository) {
        this._generateExchangeOrder = (portfolioId, order) => {
            const exchangeOrder = {
                operation: 'order',
                orderType: order.orderType,
                orderId: order.orderId,
                portfolioId: portfolioId,
                assetId: order.assetId,
                orderSide: order.orderSide,
                orderSize: order.orderSize,
            };
            if (order.orderType === 'limit') {
                exchangeOrder.orderPrice = order.orderPrice;
            }
            return exchangeOrder;
        };
        this.portfolioOrderRepository = portfolioOrderRepository;
        this.assetRepository = assetRepository;
        this.portfolioRepository = portfolioRepository;
        this.portfolioOrderEventService = new _1.PortfolioOrderEventService(portfolioOrderRepository);
        this.exchangeService = new _1.ExchangeService(assetRepository, portfolioRepository, transactionRepository, marketMakerRepository);
        this.exchangeService.on('orderExecution', (event) => {
            this._onOrderExecution(event);
        });
        this.exchangeService.on('orderFail', (event) => {
            this._onOrderFail(event);
        });
    }
    submitNewPortfolioOrderAsync(portfolioId, orderPayload) {
        return __awaiter(this, void 0, void 0, function* () {
            // verify that asset exists.
            const orderAssetId = orderPayload.assetId;
            const orderAsset = yield this.assetRepository.getDetailAsync(orderAssetId);
            if (!orderAsset) {
                const msg = `Order Failed - input assetId not registered (${orderAssetId})`;
                logger.error(msg);
                throw new __1.ConflictError(msg, { payload: orderPayload });
            }
            // verify that portfolio exists.
            const orderPortfolio = yield this.portfolioRepository.getDetailAsync(portfolioId);
            if (!orderPortfolio) {
                const msg = `Order Failed - input portfolioId not registered (${portfolioId})`;
                logger.error(msg);
                throw new __1.ConflictError(msg, { payload: orderPayload });
            }
            /////////////////////////////////////////////////////////
            /////////////////////////////////////////////////////////
            const newPortfolioOrder = __1.PortfolioOrder.newOrder(orderPayload);
            yield this.portfolioOrderRepository.storeAsync(portfolioId, newPortfolioOrder);
            const exchangeOrder = this._generateExchangeOrder(portfolioId, newPortfolioOrder);
            // if (this.eventPublisher) {
            //     await this.eventPublisher.publishExchangeOrderCreateAsync(exchangeOrder, 'orderHandler')
            // }
            yield this.exchangeService.processOrder(exchangeOrder);
            return newPortfolioOrder;
        });
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
    //     const orderPayload: TNewPortfolioOrderProps = {
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
    //     const exchangeOrder: TNewExchangeOrderConfig = this._generateExchangeOrder(portfolioId, newOrder)
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
    _onOrderExecution(event) {
        return __awaiter(this, void 0, void 0, function* () {
            this.portfolioOrderEventService.processFillEvent(event);
            if (event.sizeRemaining == 0) {
                const completeEvent = {
                    eventType: 'orderComplete',
                    publishedAt: luxon_1.DateTime.utc().toString(),
                    orderId: event.orderId,
                    portfolioId: event.portfolioId,
                };
                yield this.portfolioOrderEventService.processCompleteEvent(completeEvent);
            }
        });
    }
    _onOrderFail(event) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.error('OrederFailed', event);
            this.portfolioOrderEventService.processFailEvent(event);
        });
    }
}
exports.PortfolioOrderService = PortfolioOrderService;
