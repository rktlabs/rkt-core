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
exports.AssetRepository = void 0;
const deleters_1 = require("../util/deleters");
const admin = require("firebase-admin");
const FieldValue = admin.firestore.FieldValue;
const COLLECTION_NAME = 'assets';
const CACHE_NAME = 'assetCache';
class AssetRepository {
    constructor(db) {
        this.db = db;
    }
    listAssets(qs) {
        return __awaiter(this, void 0, void 0, function* () {
            const filter = Object.assign({}, qs);
            const page = filter.page ? parseInt(filter.page, 10) : 1;
            const pageSize = Math.min(filter.pageSize ? parseInt(filter.pageSize, 10) : 25, 1000);
            const start = (page - 1) * pageSize;
            delete filter.page; // ignore "page" querystring parm
            delete filter.pageSize; // ignore "page" querystring parm
            let entityRefCollection = this.db.collection(COLLECTION_NAME);
            if (filter) {
                for (const filterParm in filter) {
                    if (Array.isArray(filter[filterParm])) {
                        const filterValues = filter[filterParm];
                        entityRefCollection = entityRefCollection.where(filterParm, 'in', filterValues);
                    }
                    else {
                        const filterValue = filter[filterParm];
                        entityRefCollection = entityRefCollection.where(filterParm, '==', filterValue);
                    }
                }
            }
            const entityCollectionRefs = yield entityRefCollection.orderBy('assetId').offset(start).limit(pageSize).get();
            if (!entityCollectionRefs.empty) {
                const assetList = entityCollectionRefs.docs.map((entityDoc) => {
                    const entity = entityDoc.data();
                    return entity;
                });
                return assetList;
            }
            else {
                return [];
            }
        });
    }
    getAsset(assetId) {
        return __awaiter(this, void 0, void 0, function* () {
            const entityRef = this.db.collection(COLLECTION_NAME).doc(assetId);
            const entityDoc = yield entityRef.get();
            if (!entityDoc.exists) {
                return null;
            }
            else {
                const entity = entityDoc.data();
                return entity;
            }
        });
    }
    storeAsset(entity) {
        return __awaiter(this, void 0, void 0, function* () {
            const entityId = entity.assetId;
            const entityData = JSON.parse(JSON.stringify(entity));
            const entityRef = this.db.collection(COLLECTION_NAME).doc(entityId);
            yield entityRef.set(entityData);
            // store cached asset
            const cacheRecord = {
                assetId: entity.assetId,
                symbol: entity.symbol,
                type: entity.type,
                contractId: entity.contractId,
                cumulativeEarnings: entity.cumulativeEarnings,
            };
            if (entity.portfolioId) {
                cacheRecord.portfolioId = entity.portfolioId;
            }
            const cacheRef = this.db.collection(CACHE_NAME).doc(entityId);
            yield cacheRef.set(cacheRecord);
        });
    }
    updateAsset(assetId, entityData) {
        return __awaiter(this, void 0, void 0, function* () {
            const entityRef = this.db.collection(COLLECTION_NAME).doc(assetId);
            yield entityRef.update(entityData);
        });
    }
    deleteAsset(assetId) {
        return __awaiter(this, void 0, void 0, function* () {
            const entityRef = this.db.collection(COLLECTION_NAME).doc(assetId);
            yield deleters_1.deleteDocument(entityRef);
            // delete cache
            const cacheRef = this.db.collection(CACHE_NAME).doc(assetId);
            yield deleters_1.deleteDocument(cacheRef);
        });
    }
    adjustCumulativeEarnings(assetId, cumulativeEarningsDelta) {
        return __awaiter(this, void 0, void 0, function* () {
            const entityRef = this.db.collection(COLLECTION_NAME).doc(assetId);
            const data = {
                cumulativeEarnings: FieldValue.increment(cumulativeEarningsDelta),
            };
            yield entityRef.update(data);
            // adjust cache
            const cacheRef = this.db.collection(CACHE_NAME).doc(assetId);
            yield cacheRef.update(data);
        });
    }
    listContractAssets(contractId) {
        return __awaiter(this, void 0, void 0, function* () {
            let entityRefCollection = this.db.collection(COLLECTION_NAME).where('contractId', '==', contractId);
            const entityCollectionRefs = yield entityRefCollection.get();
            if (!entityCollectionRefs.empty) {
                const assetIdList = entityCollectionRefs.docs.map((entityDoc) => {
                    return entityDoc.id;
                });
                return assetIdList;
            }
            else {
                return [];
            }
        });
    }
    listEarnerAssets(earnerId) {
        return __awaiter(this, void 0, void 0, function* () {
            let entityRefCollection = this.db.collection(COLLECTION_NAME).where('earnerId', '==', earnerId);
            const entityCollectionRefs = yield entityRefCollection.get();
            if (!entityCollectionRefs.empty) {
                const assetIdList = entityCollectionRefs.docs.map((entityDoc) => {
                    return entityDoc.id;
                });
                return assetIdList;
            }
            else {
                return [];
            }
        });
    }
}
exports.AssetRepository = AssetRepository;
