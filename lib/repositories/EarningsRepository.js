'use strict';
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
exports.EarningsRepository = void 0;
const __1 = require("..");
const EARNER_COLLECTION_NAME = 'earners';
const ASSET_COLLECTION_NAME = 'assets';
const EARNING_COLLECTION_NAME = 'earnings';
class EarningsRepository {
    constructor(db) {
        this.db = db;
    }
    listEarnerEarnings(earnerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const entityCollectionRef = this.db
                .collection(EARNER_COLLECTION_NAME)
                .doc(earnerId)
                .collection(EARNING_COLLECTION_NAME)
                .orderBy('earnedAt', 'desc');
            const entityRefCollection = yield entityCollectionRef.limit(1000).get();
            const entityList = entityRefCollection.docs.map((entityDoc) => {
                const entity = entityDoc.data();
                return entity;
            });
            return entityList;
        });
    }
    storeEarnerEarning(earnerId, entity) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = __1.Earning.sig(entity);
            const entityData = JSON.parse(JSON.stringify(entity));
            const entityRef = this.db
                .collection(EARNER_COLLECTION_NAME)
                .doc(earnerId)
                .collection(EARNING_COLLECTION_NAME)
                .doc(id);
            yield entityRef.set(entityData);
        });
    }
    listAssetEarnings(assetId) {
        return __awaiter(this, void 0, void 0, function* () {
            const entityCollectionRef = this.db
                .collection(ASSET_COLLECTION_NAME)
                .doc(assetId)
                .collection(EARNING_COLLECTION_NAME)
                .orderBy('earnedAt', 'desc');
            const entityRefCollection = yield entityCollectionRef.limit(1000).get();
            const entityList = entityRefCollection.docs.map((entityDoc) => {
                const entity = entityDoc.data();
                return entity;
            });
            return entityList;
        });
    }
    storeAssetEarning(assetId, entity) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = __1.Earning.sig(entity);
            const entityData = JSON.parse(JSON.stringify(entity));
            const entityRef = this.db
                .collection(ASSET_COLLECTION_NAME)
                .doc(assetId)
                .collection(EARNING_COLLECTION_NAME)
                .doc(id);
            yield entityRef.set(entityData);
        });
    }
}
exports.EarningsRepository = EarningsRepository;
