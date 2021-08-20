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
const deleters_1 = require("../util/deleters");
const COLLECTION_NAME = 'portfolios';
const CACHE_NAME = 'portfolioCache';
class PortfolioRepository {
    constructor(db) {
        this.db = db;
    }
    listPortfolios(qs) {
        return __awaiter(this, void 0, void 0, function* () {
            const filter = Object.assign({}, qs);
            const page = filter.page ? parseInt(filter.page, 10) : 1;
            const pageSize = Math.min(filter.pageSize ? parseInt(filter.pageSize, 10) : 25, 1000);
            const start = (page - 1) * pageSize;
            delete filter.page; // ignore "page" querystring parm
            delete filter.pageSize; // ignore "page" querystring parm
            let entityCollectionRef = this.db.collection(COLLECTION_NAME);
            if (filter) {
                for (const filterParm in filter) {
                    if (Array.isArray(filter[filterParm])) {
                        const filterValues = filter[filterParm];
                        entityCollectionRef = entityCollectionRef.where(filterParm, 'in', filterValues);
                    }
                    else {
                        const filterValue = filter[filterParm];
                        entityCollectionRef = entityCollectionRef.where(filterParm, '==', filterValue);
                    }
                }
            }
            const entityRefCollection = yield entityCollectionRef.orderBy('portfolioId').offset(start).limit(pageSize).get();
            const entityList = entityRefCollection.docs.map((entityDoc) => {
                const entity = entityDoc.data();
                return entity;
            });
            return entityList;
        });
    }
    getPortfolio(entityId) {
        return __awaiter(this, void 0, void 0, function* () {
            const entityRef = this.db.collection(COLLECTION_NAME).doc(entityId);
            const entityDoc = yield entityRef.get();
            if (!entityDoc.exists) {
                return null;
            }
            const entity = (yield entityDoc.data());
            return entity;
        });
    }
    storePortfolio(entity) {
        return __awaiter(this, void 0, void 0, function* () {
            const entityId = entity.portfolioId;
            const entityData = JSON.parse(JSON.stringify(entity));
            const entityRef = this.db.collection(COLLECTION_NAME).doc(entityId);
            yield entityRef.set(entityData);
            // cache portfolio
            const cacheRecord = {
                portfolioId: entity.portfolioId,
            };
            const cacheRef = this.db.collection(CACHE_NAME).doc(entityId);
            yield cacheRef.set(cacheRecord);
        });
    }
    updatePortfolio(entityId, entityData) {
        return __awaiter(this, void 0, void 0, function* () {
            const entityRef = this.db.collection(COLLECTION_NAME).doc(entityId);
            yield entityRef.update(entityData);
        });
    }
    deletePortfolio(entityId) {
        return __awaiter(this, void 0, void 0, function* () {
            const entityRef = this.db.collection(COLLECTION_NAME).doc(entityId);
            yield deleters_1.deleteDocument(entityRef);
            // delete cache
            const cacheRef = this.db.collection(CACHE_NAME).doc(entityId);
            yield deleters_1.deleteDocument(cacheRef);
        });
    }
}
exports.PortfolioRepository = PortfolioRepository;
