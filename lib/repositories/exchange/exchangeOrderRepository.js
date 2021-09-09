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
exports.ExchangeOrderRepository = void 0;
const deleters_1 = require("../../util/deleters");
const getConnectionProps_1 = require("../getConnectionProps");
const repositoryBase_1 = require("../repositoryBase");
const COLLECTION_NAME = 'exchangeOrders';
class ExchangeOrderRepository extends repositoryBase_1.RepositoryBase {
    constructor() {
        super();
        this.filterMap = {};
        this.db = (0, getConnectionProps_1.getConnectionProps)();
    }
    getListAsync(qs) {
        return __awaiter(this, void 0, void 0, function* () {
            let entityRefCollection = this.db.collection(COLLECTION_NAME);
            entityRefCollection = this.generateFilterPredicate(qs, this.filterMap, entityRefCollection);
            entityRefCollection = this.generatePagingProperties(qs, entityRefCollection, 'orderId');
            const entityCollectionRefs = yield entityRefCollection.get();
            const orderList = entityCollectionRefs.docs
                .map((entityDoc) => {
                const entity = entityDoc.data();
                return entity;
            })
                .sort((b, a) => (a.createdAt || '').localeCompare(b.createdAt || ''));
            return orderList;
        });
    }
    getDetailAsync(orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            const entityId = `${orderId}`;
            const entityRef = this.db.collection(COLLECTION_NAME).doc(entityId);
            const entityDoc = yield entityRef.get();
            if (!entityDoc.exists) {
                return null;
            }
            const entity = entityDoc.data();
            return entity;
        });
    }
    storeAsync(entity) {
        return __awaiter(this, void 0, void 0, function* () {
            const entityId = `${entity.portfolioId}#${entity.orderId}`;
            const entityJson = JSON.parse(JSON.stringify(entity));
            yield this.db.collection(COLLECTION_NAME).doc(entityId).set(entityJson);
        });
    }
    updateAsync(portfolioId, orderId, entity) {
        return __awaiter(this, void 0, void 0, function* () {
            const entityId = `${portfolioId}#${orderId}`;
            const entityJson = JSON.parse(JSON.stringify(entity));
            const entityRef = this.db.collection(COLLECTION_NAME).doc(entityId);
            yield entityRef.update(entityJson);
        });
    }
    scrubCollectionAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            const entityRef = this.db.collection(COLLECTION_NAME);
            yield (0, deleters_1.deleteCollection)(entityRef);
        });
    }
}
exports.ExchangeOrderRepository = ExchangeOrderRepository;
