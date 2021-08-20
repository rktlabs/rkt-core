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
exports.ContractRepository = void 0;
const deleters_1 = require("../util/deleters");
const COLLECTION_NAME = 'contracts';
class ContractRepository {
    constructor(db) {
        this.db = db;
    }
    listContracts(qs) {
        return __awaiter(this, void 0, void 0, function* () {
            const filter = Object.assign({}, qs);
            const page = filter.page ? parseInt(filter.page, 10) : 1;
            const pageSize = Math.min(filter.pageSize ? parseInt(filter.pageSize, 10) : 25, 1000);
            const start = (page - 1) * pageSize;
            delete filter.page; // ignore "page" querystring parm
            delete filter.pageSize; // ignore "page" querystring parm
            let entityRefCollection = this.db.collection(COLLECTION_NAME);
            if (filter) {
                for (const filterParm in filter) {
                    if (Array.isArray(filter[filterParm])) {
                        const filterValues = filter[filterParm];
                        entityRefCollection = entityRefCollection.where(filterParm, 'in', filterValues);
                    }
                    else {
                        const filterValue = filter[filterParm];
                        entityRefCollection = entityRefCollection.where(filterParm, '==', filterValue);
                    }
                }
            }
            const entityCollectionRefs = yield entityRefCollection.orderBy('contractId').offset(start).limit(pageSize).get();
            if (!entityCollectionRefs.empty) {
                const contractList = entityCollectionRefs.docs.map((entityDoc) => {
                    const entity = entityDoc.data();
                    // entity.idd = entityDoc.id;
                    return entity;
                });
                return contractList;
            }
            else {
                return [];
            }
        });
    }
    getContract(contractId) {
        return __awaiter(this, void 0, void 0, function* () {
            const entityRef = this.db.collection(COLLECTION_NAME).doc(contractId);
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
    storeContract(entity) {
        return __awaiter(this, void 0, void 0, function* () {
            const entityId = entity.contractId;
            const entityData = JSON.parse(JSON.stringify(entity));
            const entityRef = this.db.collection(COLLECTION_NAME).doc(entityId);
            yield entityRef.set(entityData);
        });
    }
    updateContract(contractId, entityData) {
        return __awaiter(this, void 0, void 0, function* () {
            const entityRef = this.db.collection(COLLECTION_NAME).doc(contractId);
            yield entityRef.update(entityData);
        });
    }
    dropContractAsset(contractId, assetId) {
        return __awaiter(this, void 0, void 0, function* () {
            const entityRef = this.db.collection(COLLECTION_NAME).doc(contractId);
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
    addContractAsset(contractId, assetId) {
        return __awaiter(this, void 0, void 0, function* () {
            const entityRef = this.db.collection(COLLECTION_NAME).doc(contractId);
            yield this.db.runTransaction((t) => __awaiter(this, void 0, void 0, function* () {
                const entityDoc = yield t.get(entityRef);
                if (entityDoc.exists) {
                    const entity = entityDoc.data();
                    if (entity) {
                        const assetList = entity.managedAssets || [];
                        const newAssetList = [...assetList, assetId];
                        t.update(entityRef, { managedAssets: newAssetList });
                    }
                }
            }));
        });
    }
    deleteContract(contractId) {
        return __awaiter(this, void 0, void 0, function* () {
            const entityRef = this.db.collection(COLLECTION_NAME).doc(contractId);
            yield deleters_1.deleteDocument(entityRef);
        });
    }
}
exports.ContractRepository = ContractRepository;
