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
exports.MakerRepository = void 0;
const entity_1 = require("../../services/makerService/makers/makerBase/entity");
const deleters_1 = require("../../util/deleters");
const getConnectionProps_1 = require("../getConnectionProps");
const repositoryBase_1 = require("../repositoryBase");
const COLLECTION_NAME = 'makers';
class MakerRepository extends repositoryBase_1.RepositoryBase {
    constructor() {
        super();
        this.filterMap = {};
        this.db = (0, getConnectionProps_1.getConnectionProps)();
    }
    getListAsync(qs) {
        return __awaiter(this, void 0, void 0, function* () {
            let entityRefCollection = this.db.collection(COLLECTION_NAME);
            entityRefCollection = this.generateFilterPredicate(qs, this.filterMap, entityRefCollection);
            entityRefCollection = this.generatePagingProperties(qs, entityRefCollection, 'makerId');
            const entityCollectionRefs = yield entityRefCollection.get();
            if (!entityCollectionRefs.empty) {
                const makerList = entityCollectionRefs.docs.map((entityDoc) => {
                    const entity = entityDoc.data();
                    return entity;
                });
                return makerList;
            }
            else {
                return [];
            }
        });
    }
    getDetailAsync(makerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const entityRef = this.db.collection(COLLECTION_NAME).doc(makerId);
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
            let theEntity;
            if (entity instanceof entity_1.MakerBase) {
                theEntity = entity.flattenMaker();
            }
            else {
                theEntity = entity;
            }
            const entityId = theEntity.assetId;
            const entityData = JSON.parse(JSON.stringify(theEntity));
            const entityRef = this.db.collection(COLLECTION_NAME).doc(entityId);
            yield entityRef.set(entityData);
        });
    }
    updateAsync(makerId, entityData) {
        return __awaiter(this, void 0, void 0, function* () {
            const entityRef = this.db.collection(COLLECTION_NAME).doc(makerId);
            yield entityRef.update(entityData);
        });
    }
    updateMakerStateAsync(makerId, stateUpdate) {
        return __awaiter(this, void 0, void 0, function* () {
            const entityRef = this.db.collection(COLLECTION_NAME).doc(makerId);
            yield entityRef.update(stateUpdate);
        });
    }
    deleteAsync(makerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const entityRef = this.db.collection(COLLECTION_NAME).doc(makerId);
            yield (0, deleters_1.deleteDocument)(entityRef);
        });
    }
    isPortfolioUsed(portfolioId) {
        return __awaiter(this, void 0, void 0, function* () {
            // check for linked makers
            const entityRefCollection = this.db.collection('makers').where('portfolioId', '==', portfolioId);
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
exports.MakerRepository = MakerRepository;
