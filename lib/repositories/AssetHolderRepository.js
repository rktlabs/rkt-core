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
const deleters_1 = require("../util/deleters");
const COLLECTION_NAME = 'assets';
const SUB_COLLECTION_NAME = 'holders';
class AssetHolderRepository {
    constructor(db) {
        this.db = db;
    }
    storeAssetHolder(assetId, portfolioId, entity) {
        return __awaiter(this, void 0, void 0, function* () {
            const entityData = JSON.parse(JSON.stringify(entity));
            const entityRef = this.db
                .collection(COLLECTION_NAME)
                .doc(assetId)
                .collection(SUB_COLLECTION_NAME)
                .doc(portfolioId);
            yield entityRef.set(entityData);
        });
    }
    listAssetHolders(assetId) {
        return __awaiter(this, void 0, void 0, function* () {
            let entityRefCollection = this.db.collection(COLLECTION_NAME).doc(assetId).collection(SUB_COLLECTION_NAME);
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
    getAssetHolder(assetId, portfolioId) {
        return __awaiter(this, void 0, void 0, function* () {
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
    deleteAssetHolder(assetId, portfolioId) {
        return __awaiter(this, void 0, void 0, function* () {
            const entityRef = this.db
                .collection(COLLECTION_NAME)
                .doc(assetId)
                .collection(SUB_COLLECTION_NAME)
                .doc(portfolioId);
            yield deleters_1.deleteDocument(entityRef);
        });
    }
}
exports.AssetHolderRepository = AssetHolderRepository;
