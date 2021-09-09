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
exports.ExchangeTradeRepository = void 0;
const deleters_1 = require("../util/deleters");
const getConnectionProps_1 = require("./getConnectionProps");
const repositoryBase_1 = require("./repositoryBase");
const COLLECTION_NAME = 'exchangeTrades';
class ExchangeTradeRepository extends repositoryBase_1.RepositoryBase {
    constructor() {
        super();
        this.db = (0, getConnectionProps_1.getConnectionProps)();
    }
    getListAsync(qs) {
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
            // const entityRefCollection = await entityCollectionRef.orderBy('createdAt', 'desc').get();
            const entityRefCollection = yield entityCollectionRef
                .orderBy('exchangeTradeId')
                .offset(start)
                .limit(pageSize)
                .get();
            const tradeList = entityRefCollection.docs
                .map((entityDoc) => {
                const entity = entityDoc.data();
                return entity;
            })
                .sort((b, a) => (a.createdAt || a.executedAt || '').localeCompare(b.createdAt || b.executedAt || ''));
            return tradeList;
        });
    }
    getDetailAsync(tradeId) {
        return __awaiter(this, void 0, void 0, function* () {
            const entityId = `${tradeId}`;
            const entityRef = this.db.collection(COLLECTION_NAME).doc(entityId);
            const entityDoc = yield entityRef.get();
            if (!entityDoc.exists) {
                return null;
            }
            const entity = entityDoc.data();
            return entity;
        });
    }
    storeExchangeTrade(entity) {
        return __awaiter(this, void 0, void 0, function* () {
            const entityJson = JSON.parse(JSON.stringify(entity));
            const id = entity.tradeId;
            yield this.db.collection(COLLECTION_NAME).doc(id).set(entityJson);
            return id;
        });
    }
    scrubExchangeTradeCollection() {
        return __awaiter(this, void 0, void 0, function* () {
            const entityRef = this.db.collection(COLLECTION_NAME);
            yield (0, deleters_1.deleteCollection)(entityRef);
        });
    }
}
exports.ExchangeTradeRepository = ExchangeTradeRepository;
