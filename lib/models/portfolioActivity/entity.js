"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortfolioActivity = void 0;
const serialize_1 = require("./serialize");
class PortfolioActivity {
    // TODO: This is actually a stored object with several properties
    // so expand it here for completeness
    // static serialize(req: any, data: any) {
    //     return serialize(req, data)
    // }
    static serializeCollection(selfUrl, portfolioId, baseUrl, qs, data) {
        return (0, serialize_1.serializeCollection)(selfUrl, portfolioId, baseUrl, qs, data);
    }
}
exports.PortfolioActivity = PortfolioActivity;
