"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortfolioActivity = void 0;
const portfolioActivitySerializer_1 = require("./portfolioActivitySerializer");
class PortfolioActivity {
    // TODO: This is actually a stored object with several properties
    // so expand it here for completeness
    // static serialize(req: any, data: any) {
    //     return serialize(req, data)
    // }
    static serializeCollection(req, portfolioId, data) {
        return portfolioActivitySerializer_1.serializeCollection(req, portfolioId, data);
    }
}
exports.PortfolioActivity = PortfolioActivity;
