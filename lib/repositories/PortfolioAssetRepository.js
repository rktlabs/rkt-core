'use strict';
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
exports.PortfolioAssetRepository = void 0;
const deleters_1 = require("../util/deleters");
const COLLECTION_NAME = 'portfolios';
const CACHE_NAME = 'portfolioCache';
const SUB_COLLECTION_NAME = 'holdings';
class PortfolioAssetRepository {
    constructor(db) {
        this.db = db;
    }
    listPortfolioAssets(portfolioId) {
        return __awaiter(this, void 0, void 0, function* () {
            const entityCollectionRef = this.db.collection(COLLECTION_NAME).doc(portfolioId).collection(SUB_COLLECTION_NAME);
            const entityRefCollection = yield entityCollectionRef.limit(1000).get();
            const entityList = entityRefCollection.docs.map((entityDoc) => {
                const entity = entityDoc.data();
                return entity;
            });
            return entityList;
        });
    }
    getPortfolioAsset(portfolioId, assetId) {
        return __awaiter(this, void 0, void 0, function* () {
            const entityRef = this.db
                .collection(COLLECTION_NAME)
                .doc(portfolioId)
                .collection(SUB_COLLECTION_NAME)
                .doc(assetId);
            const entityDoc = yield entityRef.get();
            if (!entityDoc.exists) {
                return null;
            }
            const entity = entityDoc.data();
            return entity;
        });
    }
    storePortfolioAsset(portfolioId, assetId, entity) {
        return __awaiter(this, void 0, void 0, function* () {
            const entityData = JSON.parse(JSON.stringify(entity));
            const entityRef = this.db
                .collection(COLLECTION_NAME)
                .doc(portfolioId)
                .collection(SUB_COLLECTION_NAME)
                .doc(assetId);
            yield entityRef.set(entityData);
            // cache holding
            const cacheData = {
                portfolioId: entityData.portfolioId,
                assetId: entityData.assetId,
                units: 0,
            };
            const cacheRef = this.db.collection(CACHE_NAME).doc(portfolioId).collection(SUB_COLLECTION_NAME).doc(assetId);
            yield cacheRef.set(cacheData);
        });
    }
    deletePortfolioAsset(portfolioId, assetId) {
        return __awaiter(this, void 0, void 0, function* () {
            const entityRef = this.db
                .collection(COLLECTION_NAME)
                .doc(portfolioId)
                .collection(SUB_COLLECTION_NAME)
                .doc(assetId);
            yield deleters_1.deleteDocument(entityRef);
            // clear cache
            const cacheRef = this.db.collection(CACHE_NAME).doc(portfolioId).collection(SUB_COLLECTION_NAME).doc(assetId);
            yield deleters_1.deleteDocument(cacheRef);
        });
    }
}
exports.PortfolioAssetRepository = PortfolioAssetRepository;
