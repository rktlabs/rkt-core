"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortfolioAsset = void 0;
const portfolioAssetSerializer_1 = require("./portfolioAssetSerializer");
class PortfolioAsset {
    // TODO: This is actually a stored object sith assetId and unitCount
    // so expand it here for completeness
    static serialize(req, portfolioId, data) {
        return portfolioAssetSerializer_1.serialize(req, portfolioId, data);
    }
    static serializeCollection(req, portfolioId, data) {
        return portfolioAssetSerializer_1.serializeCollection(req, portfolioId, data);
    }
}
exports.PortfolioAsset = PortfolioAsset;
