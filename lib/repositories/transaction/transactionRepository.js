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
exports.TransactionRepository = void 0;
const log4js = require("log4js");
const deleters_1 = require("../../util/deleters");
const getConnectionProps_1 = require("../getConnectionProps");
const repositoryBase_1 = require("../repositoryBase");
const logger = log4js.getLogger('transactionRepository');
const COLLECTION_NAME = 'transactions';
class TransactionRepository extends repositoryBase_1.RepositoryBase {
    constructor() {
        super();
        this.filterMap = {};
        this.db = (0, getConnectionProps_1.getConnectionProps)();
    }
    getListAsync(qs) {
        return __awaiter(this, void 0, void 0, function* () {
            //logger.trace(`getList ${qs}`)
            let entityRefCollection = this.db.collection(COLLECTION_NAME);
            entityRefCollection = this.generateFilterPredicate(qs, this.filterMap, entityRefCollection);
            entityRefCollection = this.generatePagingProperties(qs, entityRefCollection, 'transactionId');
            const entityCollectionRefs = yield entityRefCollection.get();
            if (!entityCollectionRefs.empty) {
                const transactionList = entityCollectionRefs.docs
                    .map((entityDoc) => {
                    const entity = entityDoc.data();
                    return entity;
                })
                    .sort((b, a) => (a.createdAt || '').localeCompare(b.createdAt || ''));
                return transactionList;
            }
            else {
                return [];
            }
        });
    }
    getDetailAsync(transactionId) {
        return __awaiter(this, void 0, void 0, function* () {
            //logger.trace(`getDetail ${transactionId}`)
            const entityRef = this.db.collection(COLLECTION_NAME).doc(transactionId);
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
            logger.trace(`store ${entity.transactionId}`);
            const entityId = entity.transactionId;
            const entityData = JSON.parse(JSON.stringify(entity));
            const entityRef = yield this.db.collection(COLLECTION_NAME).doc(entityId);
            yield entityRef.set(entityData);
        });
    }
    updateAsync(transactionId, entityData) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.trace(`update ${transactionId}`);
            const entityRef = this.db.collection(COLLECTION_NAME).doc(transactionId);
            yield entityRef.update(entityData);
        });
    }
    scrubCollectionAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            const entityRef = this.db.collection(COLLECTION_NAME);
            yield (0, deleters_1.deleteCollection)(entityRef);
        });
    }
}
exports.TransactionRepository = TransactionRepository;
