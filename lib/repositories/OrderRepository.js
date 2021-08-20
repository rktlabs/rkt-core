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
exports.OrderRepository = void 0;
const COLLECTION_NAME = 'portfolios';
const SUB_COLLECTION_NAME = 'orders';
class OrderRepository {
    constructor(db) {
        this.db = db;
    }
    storePortfolioOrder(portfolioId, entity) {
        return __awaiter(this, void 0, void 0, function* () {
            const entityJson = JSON.parse(JSON.stringify(entity));
            const entityRef = yield this.db
                .collection(COLLECTION_NAME)
                .doc(portfolioId)
                .collection(SUB_COLLECTION_NAME)
                .doc(entity.orderId);
            yield entityRef.set(entityJson);
        });
    }
    listPortfolioOrders(portfolioId, filter) {
        return __awaiter(this, void 0, void 0, function* () {
            let entityCollectionRef = this.db
                .collection(COLLECTION_NAME)
                .doc(portfolioId)
                .collection(SUB_COLLECTION_NAME);
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
            const entityRefCollection = yield entityCollectionRef.limit(1000).get();
            const entityList = entityRefCollection.docs.map((entityDoc) => {
                const entity = entityDoc.data();
                return entity;
            });
            return entityList;
        });
    }
    getPortfolioOrder(portfolioId, orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            const entityRef = this.db
                .collection(COLLECTION_NAME)
                .doc(portfolioId)
                .collection(SUB_COLLECTION_NAME)
                .doc(orderId);
            const entityDoc = yield entityRef.get();
            if (!entityDoc.exists) {
                return null;
            }
            const entity = entityDoc.data();
            return entity;
        });
    }
    updatePortfolioOrder(portfolioId, orderId, entityJson) {
        return __awaiter(this, void 0, void 0, function* () {
            const entityRef = this.db
                .collection(COLLECTION_NAME)
                .doc(portfolioId)
                .collection(SUB_COLLECTION_NAME)
                .doc(orderId);
            yield entityRef.update(entityJson);
        });
    }
    atomicUpdateOrder(portfolioId, orderId, func) {
        return __awaiter(this, void 0, void 0, function* () {
            // needs to perform 1 or 2 updates and perform them in a transaction
            try {
                const entityRef = this.db
                    .collection(COLLECTION_NAME)
                    .doc(portfolioId)
                    .collection(SUB_COLLECTION_NAME)
                    .doc(orderId);
                yield this.db.runTransaction((t) => __awaiter(this, void 0, void 0, function* () {
                    const entityDoc = yield t.get(entityRef);
                    const entity = entityDoc.data();
                    if (entity) {
                        const changes = func(entity);
                        if (changes) {
                            t.update(entityRef, changes);
                        }
                    }
                }));
            }
            catch (e) {
                throw e;
            }
        });
    }
}
exports.OrderRepository = OrderRepository;
