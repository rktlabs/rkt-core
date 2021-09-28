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
exports.PortfolioOrderEventService = void 0;
const log4js = require("log4js");
const luxon_1 = require("luxon");
const __1 = require("..");
const logger = log4js.getLogger();
class PortfolioOrderEventService {
    constructor(portfolioOrderRepository) {
        this.processFillEvent = (payload) => __awaiter(this, void 0, void 0, function* () {
            const orderId = payload.orderId;
            const portfolioId = payload.portfolioId;
            let portfolioOrder = yield this.portfolioOrderRepository.getDetailAsync(portfolioId, orderId);
            if (!portfolioOrder) {
                return;
            }
            portfolioOrder.filledSize = (portfolioOrder.filledSize || 0) + payload.filledSize;
            portfolioOrder.filledValue = (portfolioOrder.filledValue || 0) + payload.filledValue;
            portfolioOrder.filledPrice =
                portfolioOrder.filledSize === 0
                    ? 0
                    : Math.abs((0, __1.round4)(portfolioOrder.filledValue / portfolioOrder.filledSize));
            portfolioOrder.sizeRemaining = payload.sizeRemaining;
            this.portfolioOrderRepository.appendOrderEvent(portfolioId, orderId, payload);
            const orderUpdate = {
                filledSize: portfolioOrder.filledSize,
                filledValue: portfolioOrder.filledValue,
                filledPrice: portfolioOrder.filledPrice,
                sizeRemaining: portfolioOrder.sizeRemaining,
                executedAt: luxon_1.DateTime.utc().toString(),
            };
            yield this.portfolioOrderRepository.updateAsync(portfolioId, orderId, orderUpdate);
            return portfolioOrder;
        });
        this.processCompleteEvent = (payload) => __awaiter(this, void 0, void 0, function* () {
            const orderId = payload.orderId;
            const portfolioId = payload.portfolioId;
            let portfolioOrder = yield this.portfolioOrderRepository.getDetailAsync(portfolioId, orderId);
            if (!portfolioOrder) {
                return;
            }
            switch (portfolioOrder.orderStatus) {
                case 'received':
                    portfolioOrder = this._updateStatus(portfolioOrder, 'filled');
                    portfolioOrder = this._close(portfolioOrder);
                    break;
                case 'filled':
                case 'failed':
                default:
                    logger.warn(`handleOrderEvent: handleFailedEvent(${portfolioOrder.orderId}) IGNORED`);
                    break;
            }
            const orderUpdate = {
                orderState: portfolioOrder.orderState,
                orderStatus: portfolioOrder.orderStatus,
                closedAt: luxon_1.DateTime.utc().toString(),
            };
            this.portfolioOrderRepository.updateAsync(portfolioId, orderId, orderUpdate);
            return portfolioOrder;
        });
        this.processFailEvent = (payload) => __awaiter(this, void 0, void 0, function* () {
            const orderId = payload.orderId;
            const portfolioId = payload.portfolioId;
            let portfolioOrder = yield this.portfolioOrderRepository.getDetailAsync(portfolioId, orderId);
            if (!portfolioOrder) {
                return;
            }
            switch (portfolioOrder.orderStatus) {
                case 'received':
                    portfolioOrder = this._updateStatus(portfolioOrder, 'failed', payload.reason);
                    portfolioOrder = this._close(portfolioOrder);
                    break;
                case 'filled':
                case 'failed':
                default:
                    logger.warn(`handleOrderEvent: handleFailedEvent(${portfolioOrder.orderId}) orderStatus: ${portfolioOrder.orderStatus} - ${payload} - IGNORED`);
                    break;
            }
            this.portfolioOrderRepository.appendOrderEvent(portfolioId, orderId, payload);
            const orderUpdate = {
                orderState: portfolioOrder.orderState,
                orderStatus: portfolioOrder.orderStatus,
                closedAt: luxon_1.DateTime.utc().toString(),
            };
            if (portfolioOrder.reason)
                orderUpdate.reason = portfolioOrder.reason;
            this.portfolioOrderRepository.updateAsync(portfolioId, orderId, orderUpdate);
            return portfolioOrder;
        });
        ////////////////////////////////////////////////////////
        // PRIVATE
        ////////////////////////////////////////////////////////
        this._close = (portfolioOrder) => {
            logger.trace(`update state for order: ${portfolioOrder.orderId} to closed`);
            portfolioOrder.orderState = 'closed';
            portfolioOrder.closedAt = luxon_1.DateTime.utc().toString();
            return portfolioOrder;
        };
        this._updateStatus = (portfolioOrder, newStatus, reason) => {
            const reasonString = reason ? `reason: ${reason}` : '';
            logger.trace(`update orderStatus for order: ${portfolioOrder.orderId} to ${newStatus} ${reasonString}`);
            portfolioOrder.orderStatus = newStatus;
            if (reason) {
                portfolioOrder.reason = reason;
            }
            return portfolioOrder;
        };
        this.portfolioOrderRepository = portfolioOrderRepository;
    }
}
exports.PortfolioOrderEventService = PortfolioOrderEventService;
