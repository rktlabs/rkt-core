"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExchangeQuote = void 0;
const exchangeQuoteSerializer_1 = require("./exchangeQuoteSerializer");
class ExchangeQuote {
    static serialize(req, data) {
        return exchangeQuoteSerializer_1.serialize(req, data);
    }
    static serializeCollection(req, data) {
        return exchangeQuoteSerializer_1.serializeCollection(req, data);
    }
}
exports.ExchangeQuote = ExchangeQuote;
