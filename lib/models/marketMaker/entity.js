'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketMaker = void 0;
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
}
exports.MarketMaker = MarketMaker;
