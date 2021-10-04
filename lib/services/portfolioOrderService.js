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
const logger = log4js.getLogger('PortfolioOrderService');
class PortfolioOrderService {
    constructor(assetRepository, portfolioRepository, transactionRepository, marketMakerRepository, portfolioOrderRepository) {
        this.portfolioOrderRepository = portfolioOrderRepository;
        this.assetRepository = assetRepository;
        this.portfolioRepository = portfolioRepository;
        this.portfolioOrderEventService = new _1.PortfolioOrderEventService(portfolioOrderRepository);
        this.exchangeService = new _1.ExchangeService(assetRepository, portfolioRepository, transactionRepository, marketMakerRepository);
        this.exchangeService.on('orderExecution', (event) => {
            this._onOrderExecution(event);
        });
        this.exchangeService.on('orderFail', (order) => {
            this._onOrderFail(order);
        });
    }
    submitNewPortfolioOrderAsync(portfolioId, orderInput) {
        return __awaiter(this, void 0, void 0, function* () {
            // verify that asset exists.
            const orderAssetId = orderInput.assetId;
            const orderAsset = yield this.assetRepository.getDetailAsync(orderAssetId);
            if (!orderAsset) {
                const msg = `Order Failed - input assetId not registered (${orderAssetId})`;
                logger.error(msg);
                throw new __1.ConflictError(msg, { payload: orderInput });
            }
            // verify that portfolio exists.
            const orderPortfolio = yield this.portfolioRepository.getDetailAsync(portfolioId);
            if (!orderPortfolio) {
                const msg = `Order Failed - input portfolioId not registered (${portfolioId})`;
                logger.error(msg);
                throw new __1.ConflictError(msg, { payload: orderInput });
            }
            /////////////////////////////////////////////////////////
            /////////////////////////////////////////////////////////
            const newPortfolioOrder = __1.PortfolioOrder.newOrder(orderInput);
            yield this.portfolioOrderRepository.storeAsync(portfolioId, newPortfolioOrder);
            // if (this.eventPublisher) {
            //     await this.eventPublisher.publishExchangeOrderCreateAsync(exchangeOrder, 'orderHandler')
            // }
            yield this.exchangeService.processOrder(orderInput);
            return newPortfolioOrder;
        });
    }
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
    _onOrderFail(order) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.error('OrederFailed', order);
            this.portfolioOrderEventService.processFailEvent(order);
        });
    }
}
exports.PortfolioOrderService = PortfolioOrderService;
