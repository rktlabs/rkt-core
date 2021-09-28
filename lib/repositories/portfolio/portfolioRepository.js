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
exports.PortfolioRepository = void 0;
const log4js = require("log4js");
const deleters_1 = require("../../util/deleters");
const cacheableRepository_1 = require("../cacheableRepository");
const getConnectionProps_1 = require("../getConnectionProps");
const logger = log4js.getLogger('PortfolioRepository');
const COLLECTION_NAME = 'portfolios';
class PortfolioRepository extends cacheableRepository_1.CacheableRepository {
    constructor() {
        super();
        this.filterMap = {
            type: 'type',
        };
        this.db = (0, getConnectionProps_1.getConnectionProps)();
    }
    getListAsync(qs) {
        return __awaiter(this, void 0, void 0, function* () {
            //logger.trace(`getList ${qs}`)
            let entityRefCollection = this.db.collection(COLLECTION_NAME);
            entityRefCollection = this.generateFilterPredicate(qs, this.filterMap, entityRefCollection);
            entityRefCollection = this.generatePagingProperties(qs, entityRefCollection, 'portfolioId');
            const entityCollectionRefs = yield entityRefCollection.get();
            const entityList = entityCollectionRefs.docs.map((entityDoc) => {
                const entity = entityDoc.data();
                return entity;
            });
            return entityList;
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
            const entity = (yield entityDoc.data());
            this.cacheEntity(entityId, entity);
            return entity;
        });
    }
    storeAsync(entity) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.trace(`store ${entity.portfolioId}`);
            this.cacheClear(entity.portfolioId);
            const entityId = entity.portfolioId;
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
    deleteAsync(entityId) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.trace(`delete ${entityId}`);
            this.cacheClear(entityId);
            const entityRef = this.db.collection(COLLECTION_NAME).doc(entityId);
            yield (0, deleters_1.deleteDocument)(entityRef);
        });
    }
}
exports.PortfolioRepository = PortfolioRepository;
