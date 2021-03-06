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
exports.PortfolioDepositRepository = void 0;
const getConnectionProps_1 = require("../getConnectionProps");
const repositoryBase_1 = require("../repositoryBase");
const COLLECTION_NAME = 'portfolios';
const SUB_COLLECTION_NAME = 'funding';
class PortfolioDepositRepository extends repositoryBase_1.RepositoryBase {
    constructor() {
        super();
        this.db = (0, getConnectionProps_1.getConnectionProps)();
    }
    getPortfolioDeposits(portfolioId) {
        return __awaiter(this, void 0, void 0, function* () {
            const entityCollectionRef = this.db.collection(COLLECTION_NAME).doc(portfolioId).collection(SUB_COLLECTION_NAME);
            const entityRefCollection = yield entityCollectionRef.limit(1000).get();
            const entityList = entityRefCollection.docs.map((entityDoc) => {
                const entity = entityDoc.data();
                return entity;
            });
            return entityList;
        });
    }
    storePortfolioDeposit(portfolioId, entity) {
        return __awaiter(this, void 0, void 0, function* () {
            const entityData = JSON.parse(JSON.stringify(entity));
            const entityRef = this.db.collection(COLLECTION_NAME).doc(portfolioId).collection(SUB_COLLECTION_NAME);
            yield entityRef.add(entityData);
        });
    }
}
exports.PortfolioDepositRepository = PortfolioDepositRepository;
