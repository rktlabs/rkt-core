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
const admin = require("firebase-admin");
const log4js = require("log4js");
const deleters_1 = require("../../util/deleters");
const cacheableRepository_1 = require("../cacheableRepository");
const getConnectionProps_1 = require("../getConnectionProps");
const logger = log4js.getLogger('assetRepository');
const FieldValue = admin.firestore.FieldValue;
const COLLECTION_NAME = 'assets';
class AssetRepository extends cacheableRepository_1.CacheableRepository {
    constructor() {
        super();
        this.filterMap = {
            leagueId: 'leagueId',
            type: 'type',
        };
        this.db = (0, getConnectionProps_1.getConnectionProps)();
    }
    getListAsync(qs) {
        return __awaiter(this, void 0, void 0, function* () {
            //logger.trace(`getList ${qs}`)
            let entityRefCollection = this.db.collection(COLLECTION_NAME);
            entityRefCollection = this.generateFilterPredicate(qs, this.filterMap, entityRefCollection);
            entityRefCollection = this.generatePagingProperties(qs, entityRefCollection, 'assetId');
            const entityCollectionRefs = yield entityRefCollection.get();
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
    getDetailAsync(entityId) {
        return __awaiter(this, void 0, void 0, function* () {
            const cachedItem = this.cacheLookup(entityId);
            if (cachedItem) {
                return cachedItem;
            }
            //logger.trace(`getDetail ${entityId}`)
            const entityRef = this.db.collection(COLLECTION_NAME).doc(entityId);
            const entityDoc = yield entityRef.get();
            if (!entityDoc.exists) {
                return null;
            }
            else {
                const entity = entityDoc.data();
                this.cacheEntity(entityId, entity);
                return entity;
            }
        });
    }
    storeAsync(entity) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.trace(`store ${entity.assetId}`);
            this.cacheClear(entity.assetId);
            const entityId = entity.assetId;
            const entityData = JSON.parse(JSON.stringify(entity));
            const entityRef = this.db.collection(COLLECTION_NAME).doc(entityId);
            yield entityRef.set(entityData);
        });
    }
    updateAsync(entityId, entityData) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.trace(`update ${entityId}`);
            this.cacheClear(entityId);
            const entityRef = this.db.collection(COLLECTION_NAME).doc(entityId);
            yield entityRef.update(entityData);
        });
    }
    addMinted(entityId, units) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.trace(`addMinted ${entityId}`);
            const entityRef = this.db.collection(COLLECTION_NAME).doc(entityId);
            yield entityRef.update({ issuedUnits: FieldValue.increment(units) });
        });
    }
    addBurned(entityId, units) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.trace(`addBurned ${entityId}`);
            const entityRef = this.db.collection(COLLECTION_NAME).doc(entityId);
            yield entityRef.update({ burnedUnits: FieldValue.increment(units) });
        });
    }
    deleteAsync(entityId) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.trace(`delete ${entityId}`);
            this.cacheClear(entityId);
            const entityRef = this.db.collection(COLLECTION_NAME).doc(entityId);
            yield (0, deleters_1.deleteDocument)(entityRef);
        });
    }
    getLeagueAssetsAsync(leagueId) {
        return __awaiter(this, void 0, void 0, function* () {
            //logger.trace(`getLeagueAssets ${leagueId}`)
            const entityRefCollection = this.db.collection(COLLECTION_NAME).where('leagueId', '==', leagueId);
            const entityCollectionRefs = yield entityRefCollection.get();
            if (!entityCollectionRefs.empty) {
                const assetList = entityCollectionRefs.docs.map((entityDoc) => {
                    const entity = entityDoc.data();
                    return { assetId: entity.assetId, displayName: entity.displayName };
                });
                return assetList;
            }
            else {
                return [];
            }
        });
    }
    isPortfolioUsed(portfolioId) {
        return __awaiter(this, void 0, void 0, function* () {
            // check for linked assets
            const entityRefCollection = this.db.collection('assets').where('portfolioId', '==', portfolioId);
            const entityCollectionRefs = yield entityRefCollection.get();
            if (entityCollectionRefs.size > 0) {
                const ids = entityCollectionRefs.docs.map((doc) => {
                    const data = doc.data();
                    return data.assetId;
                });
                const idList = ids.join(', ');
                return idList;
            }
            else {
                return null;
            }
        });
    }
    isLeagueUsed(leagueId) {
        return __awaiter(this, void 0, void 0, function* () {
            // check for linked assets
            const entityRefCollection = this.db.collection('assets').where('leagueId', '==', leagueId);
            const entityCollectionRefs = yield entityRefCollection.get();
            if (entityCollectionRefs.size > 0) {
                const ids = entityCollectionRefs.docs.map((doc) => {
                    const data = doc.data();
                    return data.assetId;
                });
                const idList = ids.join(', ');
                return idList;
            }
            else {
                return null;
            }
        });
    }
}
exports.AssetRepository = AssetRepository;
