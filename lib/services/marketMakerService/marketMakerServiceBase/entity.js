'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketMakerServiceBase = void 0;
const events_1 = require("events");
// MarketMaker holds value and shares to be sold.
class MarketMakerServiceBase {
    //constructor(props: TMarketMaker, emitter?: EventEmitter) {
    constructor(props, emitter) {
        this.marketMaker = props;
        // uses assetid, quote, params.  factory uses assetId, portfolioId, quote, ownerid
        if (emitter) {
            this.emitter = emitter;
        }
        else {
            this.emitter = new events_1.EventEmitter();
        }
    }
    on(event, listener) {
        this.emitter.on(event, listener);
    }
    emitQuote(quote) {
        this.emitter.emit('quote', quote);
    }
    emitTrade(trade) {
        this.emitter.emit('trade', trade);
    }
    emitCancelOrder(order) {
        this.emitter.emit('cancelOrder', order);
    }
    emitExpirelOrder(order) {
        this.emitter.emit('exporeOrder', order);
    }
}
exports.MarketMakerServiceBase = MarketMakerServiceBase;
