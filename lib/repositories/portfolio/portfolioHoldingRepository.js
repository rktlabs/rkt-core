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
exports.PortfolioHoldingRepository = void 0;
const log4js = require("log4js");
const deleters_1 = require("../../util/deleters");
const getConnectionProps_1 = require("../getConnectionProps");
const repositoryBase_1 = require("../repositoryBase");
const logger = log4js.getLogger('PortfolioHoldingRepository');
const COLLECTION_NAME = 'portfolios';
const SUB_COLLECTION_NAME = 'holdings';
class PortfolioHoldingRepository extends repositoryBase_1.RepositoryBase {
    constructor() {
        super();
        this.db = (0, getConnectionProps_1.getConnectionProps)();
    }
    getListAsync(portfolioId, qs) {
        return __awaiter(this, void 0, void 0, function* () {
            //logger.trace(`getList ${portfolioId}`)
            let entityRefCollection = this.db
                .collection(COLLECTION_NAME)
                .doc(portfolioId)
                .collection(SUB_COLLECTION_NAME);
            entityRefCollection = this.generatePagingProperties(qs, entityRefCollection);
            const entityCollectionRefs = yield entityRefCollection.get();
            const entityList = entityCollectionRefs.docs.map((entityDoc) => {
                const entity = entityDoc.data();
                return entity;
            });
            return entityList;
        });
    }
    getDetailAsync(portfolioId, assetId) {
        return __awaiter(this, void 0, void 0, function* () {
            //logger.trace(`getDetail ${portfolioId}/${assetId}`)
            const entityRef = this.db
                .collection(COLLECTION_NAME)
                .doc(portfolioId)
                .collection(SUB_COLLECTION_NAME)
                .doc(assetId);
            const entityDoc = yield entityRef.get();
            if (!entityDoc.exists) {
                return null;
            }
            const entity = entityDoc.data();
            return entity;
        });
    }
    storeAsync(portfolioId, assetId, entity) {
        return __awaiter(this, void 0, void 0, function* () {
            //logger.trace(`store ${COLLECTION_NAME}/${portfolioId}/${SUB_COLLECTION_NAME}/${assetId}`, entity)
            const entityData = JSON.parse(JSON.stringify(entity));
            const entityRef = this.db
                .collection(COLLECTION_NAME)
                .doc(portfolioId)
                .collection(SUB_COLLECTION_NAME)
                .doc(assetId);
            yield entityRef.set(entityData);
        });
    }
    deleteAsync(portfolioId, assetId) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.trace(`delete ${portfolioId}/${assetId}`);
            const entityRef = this.db
                .collection(COLLECTION_NAME)
                .doc(portfolioId)
                .collection(SUB_COLLECTION_NAME)
                .doc(assetId);
            yield (0, deleters_1.deleteDocument)(entityRef);
        });
    }
}
exports.PortfolioHoldingRepository = PortfolioHoldingRepository;
