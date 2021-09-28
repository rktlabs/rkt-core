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
exports.PortfolioOrderRepository = void 0;
const admin = require("firebase-admin");
const getConnectionProps_1 = require("../getConnectionProps");
const repositoryBase_1 = require("../repositoryBase");
const FieldValue = admin.firestore.FieldValue;
const COLLECTION_NAME = 'portfolios';
const SUB_COLLECTION_NAME = 'orders';
class PortfolioOrderRepository extends repositoryBase_1.RepositoryBase {
    constructor() {
        super();
        this.filterMap = {
            orderState: 'orderState',
            orderStatus: 'orderStatus',
            orderType: 'orderType',
            orderSide: 'orderSide',
        };
        this.db = (0, getConnectionProps_1.getConnectionProps)();
    }
    getListAsync(portfolioId, qs) {
        return __awaiter(this, void 0, void 0, function* () {
            let entityRefCollection = this.db
                .collection(COLLECTION_NAME)
                .doc(portfolioId)
                .collection(SUB_COLLECTION_NAME);
            entityRefCollection = this.generateFilterPredicate(qs, this.filterMap, entityRefCollection);
            entityRefCollection = this.generatePagingProperties(qs, entityRefCollection);
            const entityCollectionRefs = yield entityRefCollection.get();
            const entityList = entityCollectionRefs.docs.map((entityDoc) => {
                const entity = entityDoc.data();
                return entity;
            });
            return entityList;
        });
    }
    getDetailAsync(portfolioId, orderId) {
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
    storeAsync(portfolioId, entity) {
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
    updateAsync(portfolioId, orderId, entityJson) {
        return __awaiter(this, void 0, void 0, function* () {
            const entityRef = this.db
                .collection(COLLECTION_NAME)
                .doc(portfolioId)
                .collection(SUB_COLLECTION_NAME)
                .doc(orderId);
            yield entityRef.update(entityJson);
        });
    }
    appendOrderEvent(portfolioId, orderId, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const eventPayload = Object.assign({}, payload);
            delete eventPayload.portfolioId;
            delete eventPayload.orderId;
            delete eventPayload.sizeRemaining;
            const entityRef = this.db
                .collection(COLLECTION_NAME)
                .doc(portfolioId)
                .collection(SUB_COLLECTION_NAME)
                .doc(orderId);
            yield entityRef.update({ events: FieldValue.arrayUnion(eventPayload) });
        });
    }
}
exports.PortfolioOrderRepository = PortfolioOrderRepository;
