'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketMakerBase = void 0;
const events_1 = require("events");
const serializer_1 = require("./serializer");
// MarketMaker holds value and shares to be sold.
class MarketMakerBase {
    constructor(props, emitter) {
        this.createdAt = props.createdAt;
        this.type = props.type;
        this.assetId = props.assetId;
        this.ownerId = props.ownerId;
        this.portfolioId = props.portfolioId;
        this.tags = props.tags;
        this.params = props.params;
        this.quote = props.quote;
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
    //////////////////////////////////////////////////////
    // STATIC
    //////////////////////////////////////////////////////
    static serialize(selfUrl, baseUrl, data) {
        return (0, serializer_1.serialize)(selfUrl, baseUrl, data);
    }
    static serializeCollection(selfUrl, baseUrl, qs, data) {
        return (0, serializer_1.serializeCollection)(selfUrl, baseUrl, qs, data);
    }
}
exports.MarketMakerBase = MarketMakerBase;
