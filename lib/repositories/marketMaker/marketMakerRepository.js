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
exports.MarketMakerRepository = void 0;
const log4js = require("log4js");
const entity_1 = require("../../services/marketMakerService/marketMakerBase/entity");
const deleters_1 = require("../../util/deleters");
const getConnectionProps_1 = require("../getConnectionProps");
const repositoryBase_1 = require("../repositoryBase");
const logger = log4js.getLogger('marketMakerRepository');
const COLLECTION_NAME = 'makers';
class MarketMakerRepository extends repositoryBase_1.RepositoryBase {
    constructor() {
        super();
        this.filterMap = {};
        this.db = (0, getConnectionProps_1.getConnectionProps)();
    }
    getListAsync(qs) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.trace(`getList ${qs}`);
            let entityRefCollection = this.db.collection(COLLECTION_NAME);
            entityRefCollection = this.generateFilterPredicate(qs, this.filterMap, entityRefCollection);
            entityRefCollection = this.generatePagingProperties(qs, entityRefCollection, 'assetId');
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
    getDetailAsync(assetId) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.trace(`getDetail ${assetId}`);
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
            logger.trace(`store ${entity.assetId}`);
            let theEntity;
            if (entity instanceof entity_1.MarketMakerBase) {
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
    updateAsync(assetId, entityData) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.trace(`update ${assetId}`);
            const entityRef = this.db.collection(COLLECTION_NAME).doc(assetId);
            yield entityRef.update(entityData);
        });
    }
    updateMakerStateAsync(assetId, stateUpdate) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.trace(`updateMakerState ${assetId}`);
            const entityRef = this.db.collection(COLLECTION_NAME).doc(assetId);
            yield entityRef.update(stateUpdate);
        });
    }
    deleteAsync(assetId) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.trace(`delete ${assetId}`);
            const entityRef = this.db.collection(COLLECTION_NAME).doc(assetId);
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
exports.MarketMakerRepository = MarketMakerRepository;
