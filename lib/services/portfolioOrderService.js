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
const _1 = require(".");
const __1 = require("..");
const logger = log4js.getLogger();
class PortfolioOrderService {
    constructor(assetRepository, portfolioRepository, transactionRepository, marketMakerRepository) {
        ////////////////////////////////////////////////////////
        // PRIVATE
        ////////////////////////////////////////////////////////
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
        this.portfolioOrderRepository = new __1.PortfolioOrderRepository();
        this.assetRepository = assetRepository;
        this.portfolioRepository = portfolioRepository;
        this.exchangeService = new _1.ExchangeService(assetRepository, portfolioRepository, transactionRepository, marketMakerRepository, this.portfolioOrderRepository);
    }
    submitNewPortfolioOrderAsync(portfolioId, orderPayload) {
        return __awaiter(this, void 0, void 0, function* () {
            // verify that asset exists.
            const orderAssetId = orderPayload.assetId;
            const orderAsset = yield this.assetRepository.getDetailAsync(orderAssetId);
            if (!orderAsset) {
                const msg = `Order Failed - input assetId not registered (${orderAssetId})`;
                throw new __1.ConflictError(msg, { payload: orderPayload });
            }
            // verify that portfolio exists.
            const orderPortfolio = yield this.portfolioRepository.getDetailAsync(portfolioId);
            if (!orderPortfolio) {
                const msg = `Order Failed - input portfolioId not registered (${portfolioId})`;
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
            yield this.exchangeService.processNewExchangeOrderEvent(exchangeOrder);
            return newPortfolioOrder;
        });
    }
    unwindOrder(portfolioId, orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            const order = yield this.portfolioOrderRepository.getDetailAsync(portfolioId, orderId);
            if (!order) {
                const msg = `Order Failed - could not find order (${portfolioId}/${orderId})`;
                throw new __1.ConflictError(msg);
            }
            /////////////////////////////////////////////////////////
            /////////////////////////////////////////////////////////
            const orderPayload = {
                assetId: order.assetId,
                orderSide: order.orderSide === 'bid' ? 'ask' : 'bid',
                orderSize: order.orderSize,
                orderType: 'market',
                xids: {
                    portfolioId: portfolioId,
                },
            };
            const newOrder = __1.PortfolioOrder.newOrder(orderPayload);
            yield this.portfolioOrderRepository.storeAsync(portfolioId, newOrder);
            const exchangeOrder = this._generateExchangeOrder(portfolioId, newOrder);
            // if (this.eventPublisher) {
            //     await this.eventPublisher.publishExchangeOrderCreateAsync(exchangeOrder, 'orderHandler')
            // }
            return newOrder;
        });
    }
    // TODO: Rework Cancel Order
    cancelOrder(portfolioId, orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            const order = yield this.portfolioOrderRepository.getDetailAsync(portfolioId, orderId);
            return order;
        });
    }
    _generateCancelExchangeOrder(portfolioId, order) {
        const exchangeOrder = {
            operation: 'cancel',
            portfolioId: portfolioId,
            orderId: order.orderId,
        };
        return exchangeOrder;
    }
}
exports.PortfolioOrderService = PortfolioOrderService;
