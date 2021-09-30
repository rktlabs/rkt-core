'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketMaker = void 0;
const serializer_1 = require("./serializer");
// MarketMaker holds value and shares to be sold.
class MarketMaker {
    constructor(props) {
        this.createdAt = props.createdAt;
        this.type = props.type;
        this.assetId = props.assetId;
        this.ownerId = props.ownerId;
        this.portfolioId = props.portfolioId;
        this.tags = props.tags;
        this.params = props.params;
        this.quote = props.quote;
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
exports.MarketMaker = MarketMaker;
