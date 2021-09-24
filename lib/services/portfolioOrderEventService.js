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
exports.PortfolioOrderEventService = void 0;
const luxon_1 = require("luxon");
const __1 = require("..");
const log4js = require("log4js");
const logger = log4js.getLogger();
class PortfolioOrderEventService {
    constructor(db) {
        this.handleOrderEventAsync = (payload) => __awaiter(this, void 0, void 0, function* () {
            //logger.debug(`Handle Order TEvent: ${JSON.stringify(payload)}`)
            const orderId = payload.attributes.orderId;
            const portfolioId = payload.attributes.portfolioId;
            // NOTE: payload is captured in closure?
            yield this.orderRepository.atomicUpdateAsync(portfolioId, orderId, (order) => {
                return this.processOrderEvent(order, payload);
            });
        });
        ////////////////////////////////////////////////////////
        // PRIVATE
        ////////////////////////////////////////////////////////
        this.processOrderEvent = (order, payload) => {
            // verify that the message is not a duplicate (using messageId)
            // if it's a dup, don't process.
            const existingEvent = order.events.filter((event) => {
                return event.messageId && event.messageId === payload.messageId;
            });
            if (existingEvent.length === 0) {
                const notificationType = payload.notificationType;
                switch (notificationType) {
                    case 'OrderFill':
                        order = this.processFillEvent(order, payload);
                        break;
                    case 'OrderComplete':
                        order = this.processCompleteEvent(order, payload);
                        break;
                    case 'OrderFailed':
                        order = this.processFailedEvent(order, payload);
                        break;
                }
                return order;
            }
            else {
                return undefined;
            }
        };
        this.appendOrderEvent = (order, payload) => {
            const events = order.events || [];
            const orderEvent = {
                notificationType: payload.notificationType,
                publishedAt: payload.publishedAt,
                messageId: payload.messageId,
                nonce: payload.nonce,
                attributes: payload.attributes,
            };
            events.push(orderEvent);
            order.events = events.sort((a, b) => (a.publishedAt || '').localeCompare(b.publishedAt || ''));
            return order;
        };
        this.close = (order) => {
            order.state = 'closed';
            order.closedAt = luxon_1.DateTime.utc().toString();
            return order;
        };
        this.updateStatus = (order, newStatus, reason) => {
            order.status = newStatus;
            if (reason) {
                order.reason = reason;
            }
            return order;
        };
        this.processFillEvent = (order, payload) => {
            // can fill whenever. don't ignore (if comes out of order)
            order.filledSize = payload.attributes.filledSize;
            order.filledValue = payload.attributes.filledValue;
            order.filledPrice = payload.attributes.filledPrice;
            order.sizeRemaining = payload.attributes.sizeRemaining;
            order = this.appendOrderEvent(order, payload);
            return order;
        };
        this.processFailedEvent = (order, payload) => {
            switch (order.status) {
                case 'received':
                    order = this.updateStatus(order, 'failed', payload.attributes.reason);
                    order = this.close(order);
                    break;
                case 'filled':
                case 'failed':
                default:
                    logger.warn(`handleOrderEvent: handleFailedEvent(${order.orderId}) status: ${order.status} - ${payload} - IGNORED`);
                    payload.attributes.error = `order status: ${order.status} received event: ${payload.attributes.notificationType}`;
                    break;
            }
            order = this.appendOrderEvent(order, payload);
            return order;
        };
        this.processCompleteEvent = (order, payload) => {
            switch (order.status) {
                case 'received':
                    order = this.updateStatus(order, 'filled');
                    order = this.close(order);
                    break;
                case 'filled':
                case 'failed':
                default:
                    logger.warn(`handleOrderEvent: handleFailedEvent(${order.orderId}) IGNORED`);
                    payload.attributes.error = `order status: ${order.status} received event: ${payload.attributes.notificationType}`;
                    break;
            }
            order = this.appendOrderEvent(order, payload);
            return order;
        };
        this.orderRepository = new __1.PortfolioOrderRepository();
    }
}
exports.PortfolioOrderEventService = PortfolioOrderEventService;
