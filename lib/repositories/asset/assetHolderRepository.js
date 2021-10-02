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
exports.AssetHolderRepository = void 0;
const log4js = require("log4js");
const deleters_1 = require("../../util/deleters");
const getConnectionProps_1 = require("../getConnectionProps");
const repositoryBase_1 = require("../repositoryBase");
const logger = log4js.getLogger('AssetHolderRepository');
const COLLECTION_NAME = 'assets';
const SUB_COLLECTION_NAME = 'holders';
class AssetHolderRepository extends repositoryBase_1.RepositoryBase {
    constructor() {
        super();
        this.db = (0, getConnectionProps_1.getConnectionProps)();
    }
    getListAsync(assetId, qs) {
        return __awaiter(this, void 0, void 0, function* () {
            //logger.trace(`getList ${assetId}`)
            let entityRefCollection = this.db
                .collection(COLLECTION_NAME)
                .doc(assetId)
                .collection(SUB_COLLECTION_NAME);
            entityRefCollection = this.generatePagingProperties(qs, entityRefCollection);
            const entityCollectionRefs = yield entityRefCollection.get();
            if (!entityCollectionRefs.empty) {
                const itemList = entityCollectionRefs.docs.map((entityDoc) => {
                    const entity = entityDoc.data();
                    return entity;
                });
                return itemList;
            }
            else {
                return [];
            }
        });
    }
    getDetailAsync(assetId, portfolioId) {
        return __awaiter(this, void 0, void 0, function* () {
            //logger.trace(`getDetail ${assetId}/ ${portfolioId}`)
            const entityRef = this.db
                .collection(COLLECTION_NAME)
                .doc(assetId)
                .collection(SUB_COLLECTION_NAME)
                .doc(portfolioId);
            const entityDoc = yield entityRef.get();
            if (!entityDoc.exists) {
                return null;
            }
            const entity = entityDoc.data();
            return entity;
        });
    }
    storeAsync(assetId, portfolioId, entity) {
        return __awaiter(this, void 0, void 0, function* () {
            //logger.trace(`store ${COLLECTION_NAME}/${assetId}/${SUB_COLLECTION_NAME}/${portfolioId}`, entity)
            const entityData = JSON.parse(JSON.stringify(entity));
            const entityRef = this.db
                .collection(COLLECTION_NAME)
                .doc(assetId)
                .collection(SUB_COLLECTION_NAME)
                .doc(portfolioId);
            yield entityRef.set(entityData);
        });
    }
    deleteAsync(assetId, portfolioId) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.trace(`delete ${assetId}/ ${portfolioId}`);
            const entityRef = this.db
                .collection(COLLECTION_NAME)
                .doc(assetId)
                .collection(SUB_COLLECTION_NAME)
                .doc(portfolioId);
            yield (0, deleters_1.deleteDocument)(entityRef);
        });
    }
}
exports.AssetHolderRepository = AssetHolderRepository;
