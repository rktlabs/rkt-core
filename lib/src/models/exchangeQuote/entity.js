'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExchangeQuote = void 0;
const serializer_1 = require("./serializer");
class ExchangeQuote {
    static serialize(selfUrl, baseUrl, data) {
        return (0, serializer_1.serialize)(selfUrl, baseUrl, data);
    }
    static serializeCollection(selfUrl, baseUrl, qs, data) {
        return (0, serializer_1.serializeCollection)(selfUrl, baseUrl, qs, data);
    }
}
exports.ExchangeQuote = ExchangeQuote;
