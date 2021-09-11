// tslint:disable:no-unused-expression
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
exports.DummyEventPublisher = void 0;
const Events = require("./events");
class DummyEventPublisher {
    ////////////////////////////////////////////////////////
    // Messages - Full objects - not events
    ////////////////////////////////////////////////////////
    // NOT USED
    // async publishAssetCreateAsync(asset: Models.Asset, source?: string) {
    //     const event = new Events.AssetNewEvent(asset)
    //     return this.publishMessageToTopicAsync('assetCreate', event, source)
    // }
    // NOT USED
    // async publishPortfolioCreateAsync(portfolio: Models.Portfolio, source?: string) {
    //     const event = new Events.PortfolioNewEvent(portfolio)
    //     return this.publishMessageToTopicAsync('portfolioCreate', event, source)
    // }
    // async publishTransactionCreateAsync(transaction: Models.Transaction, source?: string) {
    //     const event = new Events.TransactionEventNew(transaction)
    //     return this.publishMessageToTopicAsync('transactionCreate', event, source)
    // }
    publishExchangeOrderCreateAsync(exchangeOrder, source) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = new Events.ExchangeOrderEventNew(exchangeOrder);
            return this.publishMessageToTopicAsync('exchangeOrderCreate', event, source);
        });
    }
    publishExchangeOrderCancelAsync(cancelOrder, source) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = new Events.ExchangeOrderEventCancel(cancelOrder);
            return this.publishMessageToTopicAsync('exchangeOrderCreate', event, source);
        });
    }
    ////////////////////////////////////////////////////////
    // Events
    ////////////////////////////////////////////////////////
    publishErrorEventAsync(error, sourceData) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = new Events.ErrorEvent(error);
            return this.publishMessageToTopicAsync('errorEvent', event, sourceData);
        });
    }
    publishWarningEventAsync(error, sourceData) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = new Events.WarningEvent(error);
            return this.publishMessageToTopicAsync('errorEvent', event, sourceData);
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
    //     return this.publishMessageToTopicAsync('assetEvent', event, source)
    // }
    // async publishPortfolioNewEventAsync(portfolio: Models.Portfolio, source?: string) {
    //     const event = new Events.PortfolioNewEvent({
    //         portfolioType: portfolio.type,
    //         portfolioId: portfolio.portfolioId,
    //         xids: portfolio.xids,
    //         tags: portfolio.tags,
    //     })
    //     return this.publishMessageToTopicAsync('portfolioEvent', event, source)
    // }
    publishTransactionEventUpdatePortfolioAsync(transaction, leg, source) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = new Events.TransactionEventPortfolioUpdateEvent({
                transactionId: transaction.transactionId,
                xids: transaction.xids,
                portfolioId: leg.portfolioId,
                assetId: leg.assetId,
                units: leg.units,
                tags: transaction.tags,
            });
            return this.publishMessageToTopicAsync('transactionEvent', event, source);
        });
    }
    publishTransactionEventCompleteAsync(transaction, source) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = new Events.TransactionEventComplete({
                transactionId: transaction.transactionId,
                xids: transaction.xids,
                tags: transaction.tags,
                status: transaction.status,
            });
            return this.publishMessageToTopicAsync('transactionEvent', event, source);
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
            return this.publishMessageToTopicAsync('transactionEvent', event, source);
        });
    }
    publishOrderEventFailedAsync(portfolioId, orderId, reason, source) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = new Events.OrderEventFailed({
                portfolioId,
                orderId,
                reason,
            });
            return this.publishMessageToTopicAsync('orderEvent', event, source);
        });
    }
    publishOrderEventCompleteAsync(portfolioId, orderId, tradeId, source) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = new Events.OrderEventComplete({
                orderId,
                portfolioId,
                tradeId,
            });
            return this.publishMessageToTopicAsync('orderEvent', event, source);
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
            return this.publishMessageToTopicAsync('orderEvent', event, source);
        });
    }
    ////////////////////////////////////////////////////////
    // Private
    ////////////////////////////////////////////////////////
    publishMessageToTopicAsync(topicName, payload, source) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`message to: ${source}`);
            console.log(payload);
            return topicName;
        });
    }
}
exports.DummyEventPublisher = DummyEventPublisher;
