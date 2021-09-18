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
exports.EventPublisherBase = void 0;
const luxon_1 = require("luxon");
const Events = require("./events");
class EventPublisherBase {
    constructor(publisher) {
        this.publisher = publisher;
    }
    ////////////////////////////////////////////////////////
    // Messages - Full objects - not events
    ////////////////////////////////////////////////////////
    // NOT USED
    // async publishAssetCreateAsync(asset: Models.Asset, source?: string) {
    //     const event = new Events.AssetNewEvent(asset)
    //     return this.publishMessage('assetCreate', event, source)
    // }
    // NOT USED
    // async publishPortfolioCreateAsync(portfolio: Models.Portfolio, source?: string) {
    //     const event = new Events.PortfolioNewEvent(portfolio)
    //     return this.publishMessage('portfolioCreate', event, source)
    // }
    // async publishTransactionCreateAsync(transaction: Models.Transaction, source?: string) {
    //     const event = new Events.TransactionEventNew(transaction)
    //     return this.publishMessage('transactionCreate', event, source)
    // }
    ////////////////////////////////////////////////////////
    // Exchange Order Events
    ////////////////////////////////////////////////////////
    publishExchangeOrderCreateAsync(exchangeOrder, source) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = new Events.ExchangeOrderEventNew(exchangeOrder);
            return this.publishMessage('exchangeOrderCreate', event, source);
        });
    }
    publishExchangeOrderCancelAsync(cancelOrder, source) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = new Events.ExchangeOrderEventCancel(cancelOrder);
            return this.publishMessage('exchangeOrderCreate', event, source);
        });
    }
    ////////////////////////////////////////////////////////
    // Error Events
    ////////////////////////////////////////////////////////
    // NOT USED - keep
    publishErrorEventAsync(error, sourceData) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = new Events.ErrorEvent(error);
            return this.publishMessage('errorEvent', event, sourceData);
        });
    }
    // NOT USED - keep
    publishWarningEventAsync(error, sourceData) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = new Events.WarningEvent(error);
            return this.publishMessage('errorEvent', event, sourceData);
        });
    }
    // NOT USED
    // async publishAssetNewEventAsync(asset: Models.Asset, source?: string) {
    //     const event = new Events.AssetNewEvent({
    //         assetType: asset.type,
    //         assetId: asset.assetId,
    //         portfolioId: asset.portfolioId,
    //         xids: asset.xids,
    //         tags: asset.tags,
    //     })
    //     return this.publishMessage('assetEvent', event, source)
    // }
    // async publishPortfolioNewEventAsync(portfolio: Models.Portfolio, source?: string) {
    //     const event = new Events.PortfolioNewEvent({
    //         portfolioType: portfolio.type,
    //         portfolioId: portfolio.portfolioId,
    //         xids: portfolio.xids,
    //         tags: portfolio.tags,
    //     })
    //     return this.publishMessage('portfolioEvent', event, source)
    // }
    ////////////////////////////////////////////////////////
    // Transaction Events
    ////////////////////////////////////////////////////////
    // async publishTransactionEventUpdatePortfolioAsync(transaction: Models.Transaction, leg: any, source?: string) {
    //     const event = new Events.TransactionEventPortfolioUpdateEvent({
    //         transactionId: transaction.transactionId,
    //         xids: transaction.xids,
    //         portfolioId: leg.portfolioId,
    //         assetId: leg.assetId,
    //         units: leg.units,
    //         tags: transaction.tags,
    //     })
    //     return this.publishMessage('transactionEvent', event, source)
    // }
    publishTransactionEventCompleteAsync(transaction, source) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = new Events.TransactionEventComplete({
                transactionId: transaction.transactionId,
                xids: transaction.xids,
                tags: transaction.tags,
                status: transaction.status,
            });
            return this.publishMessage('transactionEvent', event, source);
        });
    }
    publishTransactionEventErrorAsync(transaction, reason, source, stack = null) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = new Events.TransactionEventError({
                transactionId: transaction.transactionId,
                xids: transaction.xids,
                status: transaction.status,
                reason,
            });
            if (!stack) {
                event.attributes.stack = stack;
            }
            return this.publishMessage('transactionEvent', event, source);
        });
    }
    ////////////////////////////////////////////////////////
    // Order Events
    ////////////////////////////////////////////////////////
    publishOrderEventFailedAsync(portfolioId, orderId, reason, source) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = new Events.OrderEventFailed({
                portfolioId,
                orderId,
                reason,
            });
            return this.publishMessage('orderEvent', event, source);
        });
    }
    publishOrderEventCompleteAsync(portfolioId, orderId, tradeId, source) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = new Events.OrderEventComplete({
                orderId,
                portfolioId,
                tradeId,
            });
            return this.publishMessage('orderEvent', event, source);
        });
    }
    publishOrderEventFillAsync(portfolioId, orderId, filledSize, filledValue, filledPrice, sizeRemaining, source) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = new Events.OrderEventFill({
                orderId,
                portfolioId,
                filledSize,
                filledValue,
                filledPrice,
                sizeRemaining,
            });
            return this.publishMessage('orderEvent', event, source);
        });
    }
    ////////////////////////////////////////////////////////
    // Private
    ////////////////////////////////////////////////////////
    publishMessage(topicName, payload, source) {
        return __awaiter(this, void 0, void 0, function* () {
            payload.publishedAt = luxon_1.DateTime.utc().toString();
            if (source) {
                payload.source = source;
            }
            return this.publisher.publishMessage(topicName, payload);
        });
    }
}
exports.EventPublisherBase = EventPublisherBase;
