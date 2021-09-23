'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortfolioHolding = void 0;
const serializer_1 = require("./serializer");
class PortfolioHolding {
    static serialize(selfUrl, portfolioId, baseUrl, data) {
        return (0, serializer_1.serialize)(selfUrl, portfolioId, baseUrl, data);
    }
    static serializeCollection(selfUrl, portfolioId, baseUrl, qs, data) {
        return (0, serializer_1.serializeCollection)(selfUrl, portfolioId, baseUrl, qs, data);
    }
}
exports.PortfolioHolding = PortfolioHolding;
