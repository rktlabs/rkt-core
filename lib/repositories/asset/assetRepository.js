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
const deleters_1 = require("../../util/deleters");
const getConnectionProps_1 = require("../getConnectionProps");
const repositoryBase_1 = require("../repositoryBase");
const COLLECTION_NAME = 'assets';
class AssetRepository extends repositoryBase_1.RepositoryBase {
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
    getDetailAsync(assetId) {
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
    storeAsync(entity) {
        return __awaiter(this, void 0, void 0, function* () {
            const entityId = entity.assetId;
            const entityData = JSON.parse(JSON.stringify(entity));
            const entityRef = this.db.collection(COLLECTION_NAME).doc(entityId);
            yield entityRef.set(entityData);
        });
    }
    updateAsync(assetId, entityData) {
        return __awaiter(this, void 0, void 0, function* () {
            const entityRef = this.db.collection(COLLECTION_NAME).doc(assetId);
            yield entityRef.update(entityData);
        });
    }
    deleteAsync(assetId) {
        return __awaiter(this, void 0, void 0, function* () {
            const entityRef = this.db.collection(COLLECTION_NAME).doc(assetId);
            yield (0, deleters_1.deleteDocument)(entityRef);
        });
    }
    getLeagueAssetsAsync(leagueId) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: renaem leagueId to leagueId
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
