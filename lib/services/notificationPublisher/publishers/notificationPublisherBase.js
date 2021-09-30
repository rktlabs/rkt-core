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
exports.NotificationPublisherBase = void 0;
const Notifications = require("../notification");
class NotificationPublisherBase {
    constructor() { }
    ////////////////////////////////////////////////////////
    // ExchangeOrder Notifications
    ////////////////////////////////////////////////////////
    publishExchangeOrderCreateAsync(exchangeOrder, source) {
        return __awaiter(this, void 0, void 0, function* () {
            const notificationPayload = new Notifications.ExchangeOrderNew(source, 'exchangeOrderCreate', exchangeOrder);
            return this.publishNotification(notificationPayload);
        });
    }
    // async publishExchangeOrderCancelAsync(cancelOrder: Models.TExchangeCancelOrder, source: string) {
    //     const notificationPayload = new Notifications.ExchangeOrderCancel(source, 'exchangeOrderCreate', cancelOrder)
    //     return this.publishNotification(notificationPayload)
    // }
    ////////////////////////////////////////////////////////
    // Error/Warning Notifications
    ////////////////////////////////////////////////////////
    // NOT USED - keep
    publishErrorEventAsync(error, source) {
        return __awaiter(this, void 0, void 0, function* () {
            const notificationPayload = new Notifications.ErrorNotification(source, 'errorLog', error);
            return this.publishNotification(notificationPayload);
        });
    }
    // // NOT USED - keep
    publishWarningEventAsync(warning, source) {
        return __awaiter(this, void 0, void 0, function* () {
            const notificationPayload = new Notifications.WarningNotification(source, 'errorLog', warning);
            return this.publishNotification(notificationPayload);
        });
    }
    ////////////////////////////////////////////////////////
    // Transaction Notifications
    ////////////////////////////////////////////////////////
    publishTransactionEventCompleteAsync(transaction, source) {
        return __awaiter(this, void 0, void 0, function* () {
            const notificationPayload = new Notifications.TransactionComplete(source, 'transactionEvent', {
                transactionId: transaction.transactionId,
                xids: transaction.xids,
                tags: transaction.tags,
                transactionStatus: transaction.transactionStatus,
            });
            return this.publishNotification(notificationPayload);
        });
    }
    publishTransactionEventErrorAsync(transaction, reason, source, stack = null) {
        return __awaiter(this, void 0, void 0, function* () {
            const notificationPayload = new Notifications.TransactionError(source, 'transactionEvent', {
                transactionId: transaction.transactionId,
                xids: transaction.xids,
                transactionStatus: transaction.transactionStatus,
                reason,
            });
            if (!stack) {
                notificationPayload.attributes.stack = stack;
            }
            return this.publishNotification(notificationPayload);
        });
    }
    ////////////////////////////////////////////////////////
    // PortfolioOrder Notifications
    ////////////////////////////////////////////////////////
    publishOrderEventFailedAsync(portfolioId, orderId, reason, source) {
        return __awaiter(this, void 0, void 0, function* () {
            const notificationPayload = new Notifications.OrderFailed(source, 'orderEvent', {
                portfolioId,
                orderId,
                reason,
            });
            return this.publishNotification(notificationPayload);
        });
    }
    publishOrderEventCompleteAsync(portfolioId, orderId, tradeId, source) {
        return __awaiter(this, void 0, void 0, function* () {
            const notificationPayload = new Notifications.OrderComplete(source, 'orderEvent', {
                orderId,
                portfolioId,
                tradeId,
            });
            return this.publishNotification(notificationPayload);
        });
    }
    publishOrderEventFillAsync(portfolioId, orderId, filledSize, filledValue, filledPrice, sizeRemaining, source) {
        return __awaiter(this, void 0, void 0, function* () {
            const notificationPayload = new Notifications.OrderFill(source, 'orderEvent', {
                orderId,
                portfolioId,
                filledSize,
                filledValue,
                filledPrice,
                sizeRemaining,
            });
            return this.publishNotification(notificationPayload);
        });
    }
}
exports.NotificationPublisherBase = NotificationPublisherBase;
