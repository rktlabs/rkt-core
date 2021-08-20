'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetCache = void 0;
const COLLECTION_NAME = 'assetCache';
class AssetCache {
    constructor(db) {
        this.db = db;
    }
    lookupAsset(assetId) {
        return __awaiter(this, void 0, void 0, function* () {
            const entityRef = this.db.collection(COLLECTION_NAME).doc(assetId);
            const entityDoc = yield entityRef.get();
            if (!entityDoc.exists) {
                return null;
            }
            else {
                const entity = entityDoc.data();
                if (entity) {
                    const asset = {
                        assetId: entity.assetId || entity.id,
                        symbol: entity.symbol,
                        type: entity.type,
                        portfolioId: entity.portfolioId,
                        contractId: entity.contractId,
                        cumulativeEarnings: entity.cumulativeEarnings,
                    };
                    return asset;
                }
                else {
                    return null;
                }
            }
        });
    }
}
exports.AssetCache = AssetCache;
