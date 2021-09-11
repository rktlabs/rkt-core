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
exports.LeagueRepository = void 0;
const deleters_1 = require("../../util/deleters");
const getConnectionProps_1 = require("../getConnectionProps");
const repositoryBase_1 = require("../repositoryBase");
const COLLECTION_NAME = 'leagues';
class LeagueRepository extends repositoryBase_1.RepositoryBase {
    constructor() {
        super();
        this.filterMap = {
            leagueId: 'leagueId',
            contracId: 'contracId',
            type: 'type',
        };
        this.db = (0, getConnectionProps_1.getConnectionProps)();
    }
    getListAsync(qs) {
        return __awaiter(this, void 0, void 0, function* () {
            let entityRefCollection = this.db.collection(COLLECTION_NAME);
            entityRefCollection = this.generateFilterPredicate(qs, this.filterMap, entityRefCollection);
            entityRefCollection = this.generatePagingProperties(qs, entityRefCollection, 'leagueId');
            const entityCollectionRefs = yield entityRefCollection.get();
            if (!entityCollectionRefs.empty) {
                const leagueList = entityCollectionRefs.docs.map((entityDoc) => {
                    const entity = entityDoc.data();
                    return entity;
                });
                return leagueList;
            }
            else {
                return [];
            }
        });
    }
    getDetailAsync(leagueId) {
        return __awaiter(this, void 0, void 0, function* () {
            const entityRef = this.db.collection(COLLECTION_NAME).doc(leagueId);
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
            const entityId = entity.leagueId;
            const entityData = JSON.parse(JSON.stringify(entity));
            const entityRef = this.db.collection(COLLECTION_NAME).doc(entityId);
            yield entityRef.set(entityData);
        });
    }
    updateAsync(leagueId, entityData) {
        return __awaiter(this, void 0, void 0, function* () {
            const entityRef = this.db.collection(COLLECTION_NAME).doc(leagueId);
            yield entityRef.update(entityData);
        });
    }
    deleteAsync(leagueId) {
        return __awaiter(this, void 0, void 0, function* () {
            const entityRef = this.db.collection(COLLECTION_NAME).doc(leagueId);
            yield (0, deleters_1.deleteDocument)(entityRef);
        });
    }
    isPortfolioUsed(portfolioId) {
        return __awaiter(this, void 0, void 0, function* () {
            // check for linked leagues
            const entityRefCollection = this.db.collection('leagues').where('portfolioId', '==', portfolioId);
            const entityCollectionRefs = yield entityRefCollection.get();
            if (entityCollectionRefs.size > 0) {
                const ids = entityCollectionRefs.docs.map((doc) => {
                    const data = doc.data();
                    return data.leagueId;
                });
                const idList = ids.join(', ');
                return idList;
            }
            else {
                return null;
            }
        });
    }
    dropLeagueAsset(leagueId, assetId) {
        return __awaiter(this, void 0, void 0, function* () {
            const entityRef = this.db.collection(COLLECTION_NAME).doc(leagueId);
            yield this.db.runTransaction((t) => __awaiter(this, void 0, void 0, function* () {
                const entityDoc = yield t.get(entityRef);
                if (entityDoc.exists) {
                    const entity = entityDoc.data();
                    if (entity) {
                        const assetList = entity.managedAssets || [];
                        const newAssetList = assetList.filter((targetId) => {
                            return targetId != assetId;
                        });
                        t.update(entityRef, { managedAssets: newAssetList });
                    }
                }
            }));
        });
    }
    addLeagueAsset(leagueId, asset) {
        return __awaiter(this, void 0, void 0, function* () {
            const entityRef = this.db.collection(COLLECTION_NAME).doc(leagueId);
            yield this.db.runTransaction((t) => __awaiter(this, void 0, void 0, function* () {
                const entityDoc = yield t.get(entityRef);
                if (entityDoc.exists) {
                    const entity = entityDoc.data();
                    if (entity) {
                        const assetList = entity.managedAssets || [];
                        const newAssetList = [...assetList, { id: asset.assetId, displayName: asset.displayName }];
                        t.update(entityRef, { managedAssets: newAssetList });
                    }
                }
            }));
        });
    }
}
exports.LeagueRepository = LeagueRepository;
