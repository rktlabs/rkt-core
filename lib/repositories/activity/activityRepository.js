"use strict";
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
exports.ActivityRepository = void 0;
const admin = require("firebase-admin");
const log4js = require("log4js");
const __1 = require("../..");
const getConnectionProps_1 = require("../getConnectionProps");
const repositoryBase_1 = require("../repositoryBase");
const logger = log4js.getLogger('AssetActivityRepository');
const FieldValue = admin.firestore.FieldValue;
const ACTIVITY_COLLECTION_NAME = 'activity';
const PORTFOLIO_COLLECTION_NAME = 'portfolios';
const HOLDINGS_COLLECTION_NAME = 'holdings';
const ASSET_COLLECTION_NAME = 'assets';
const HOLDERS_COLLECTION_NAME = 'holders';
class ActivityRepository extends repositoryBase_1.RepositoryBase {
    constructor() {
        super();
        this.filterMap = {
            portfolioId: 'portfilioId',
            assetId: 'assetId',
            source: 'source',
            transactionId: 'transactionId',
            orderId: 'orderId',
            tradeId: 'tradeId',
        };
        this.db = (0, getConnectionProps_1.getConnectionProps)();
    }
    getPortfolioListAsync(portfolioId, qs) {
        return __awaiter(this, void 0, void 0, function* () {
            const newqs = Object.assign(Object.assign({}, qs), { portfolioId: portfolioId });
            return this.getListAsync(newqs);
        });
    }
    getAssetListAsync(assetId, qs) {
        return __awaiter(this, void 0, void 0, function* () {
            const newqs = Object.assign(Object.assign({}, qs), { assetId: assetId });
            return this.getListAsync(newqs);
        });
    }
    getPortfolioAssetListAsync(portfolioId, assetId, qs) {
        return __awaiter(this, void 0, void 0, function* () {
            const newqs = Object.assign(Object.assign({}, qs), { portfolioId: portfolioId, assetId: assetId });
            return this.getListAsync(newqs);
        });
    }
    getListAsync(qs) {
        return __awaiter(this, void 0, void 0, function* () {
            let entityRefCollection = this.db.collection(ASSET_COLLECTION_NAME);
            entityRefCollection = this.generateFilterPredicate(qs, this.filterMap, entityRefCollection);
            entityRefCollection = this.generatePagingProperties(qs, entityRefCollection, 'createdAt');
            const entityCollectionRefs = yield entityRefCollection.get();
            const entityList = entityCollectionRefs.docs.map((entityDoc) => {
                const entity = entityDoc.data();
                return entity;
            });
            return entityList;
        });
    }
    atomicUpdateTransactionAsync(updateSet, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.trace(`update holdings`, updateSet);
            // compile the refs and increments (outside of batch)
            const updates = updateSet.map((updateItem) => {
                var _a, _b, _c, _d;
                const deltaUnits = updateItem.deltaUnits;
                const assetId = updateItem.assetId;
                const portfolioId = updateItem.portfolioId;
                const units = updateItem.deltaUnits;
                const transactionId = transaction.transactionId;
                const createdAt = transaction.createdAt;
                const orderId = (_a = transaction.xids) === null || _a === void 0 ? void 0 : _a.orderId;
                const orderPortfolioId = (_b = transaction.xids) === null || _b === void 0 ? void 0 : _b.orderPortfolioId;
                const source = (_c = transaction.tags) === null || _c === void 0 ? void 0 : _c.source;
                const tradeId = (_d = transaction.xids) === null || _d === void 0 ? void 0 : _d.tradeId;
                // TODO: Let firestore generate Id
                const activityId = (0, __1.generateId)();
                const portfolioHoldingRef = this.db
                    .collection(PORTFOLIO_COLLECTION_NAME)
                    .doc(portfolioId)
                    .collection(HOLDINGS_COLLECTION_NAME)
                    .doc(assetId);
                const activityRef = this.db.collection(ACTIVITY_COLLECTION_NAME).doc(activityId);
                const assetHolderRef = this.db
                    .collection(ASSET_COLLECTION_NAME)
                    .doc(assetId)
                    .collection(HOLDERS_COLLECTION_NAME)
                    .doc(portfolioId);
                const activityItem = {
                    createdAt: createdAt,
                    assetId: assetId,
                    portfolioId: portfolioId,
                    units: units,
                    transactionId: transactionId,
                };
                if (orderId)
                    activityItem.orderId = orderId;
                if (orderPortfolioId)
                    activityItem.orderPortfolioId = orderPortfolioId;
                if (source)
                    activityItem.source = source;
                if (tradeId)
                    activityItem.tradeId = tradeId;
                return {
                    portfolioHoldingRef: portfolioHoldingRef,
                    assetHolderRef: assetHolderRef,
                    activityRef: activityRef,
                    deltaUnits,
                    activityItem,
                };
            });
            // execute the batch of writes as an atomic set.
            const batch = this.db.batch();
            updates.forEach((item) => {
                // update assets.holders
                batch.update(item.portfolioHoldingRef, { units: FieldValue.increment(item.deltaUnits) });
                // update assets.holders
                batch.update(item.assetHolderRef, { units: FieldValue.increment(item.deltaUnits) });
                // update assets.activity
                batch.set(item.activityRef, item.activityItem);
            });
            yield batch.commit();
        });
    }
}
exports.ActivityRepository = ActivityRepository;
