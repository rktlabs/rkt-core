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
exports.PortfolioActivityRepository = void 0;
const deleters_1 = require("../util/deleters");
const admin = require("firebase-admin");
const FieldValue = admin.firestore.FieldValue;
const COLLECTION_NAME = 'portfolios';
const HOLDINGS_COLLECTION_NAME = 'holdings';
const ACTIVITY_COLLECTION_NAME = 'activity';
const PORTFOLIO_CACHE = 'portfolioCache';
const ASSET_COLLECTION_NAME = 'assets';
const HOLDERS_COLLECTION_NAME = 'holders';
class PortfolioActivityRepository {
    constructor(dataSource) {
        this.db = dataSource;
    }
    listPortfolioActivity(portfolioId) {
        return __awaiter(this, void 0, void 0, function* () {
            const entityCollectionRef = this.db
                .collection(COLLECTION_NAME)
                .doc(portfolioId)
                .collection(ACTIVITY_COLLECTION_NAME);
            const entityRefCollection = yield entityCollectionRef.limit(1000).get();
            const entityList = entityRefCollection.docs.map((entityDoc) => {
                const entity = entityDoc.data();
                return entity;
            });
            return entityList;
        });
    }
    scrubPortfolioActivityCollection(portfolioId) {
        return __awaiter(this, void 0, void 0, function* () {
            const entityRef = this.db.collection(COLLECTION_NAME).doc(portfolioId).collection(ACTIVITY_COLLECTION_NAME);
            yield deleters_1.deleteCollection(entityRef);
        });
    }
    atomicUpdateTransaction(transactionId, updateSet, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            // compile the refs and increments (outside of batch)
            const updates = updateSet.map((updateItem) => {
                const entityRef = this.db
                    .collection(COLLECTION_NAME)
                    .doc(updateItem.portfolioId)
                    .collection(HOLDINGS_COLLECTION_NAME)
                    .doc(updateItem.assetId);
                const cacheRef = this.db
                    .collection(PORTFOLIO_CACHE)
                    .doc(updateItem.portfolioId)
                    .collection(HOLDINGS_COLLECTION_NAME)
                    .doc(updateItem.assetId);
                const assetHolderRef = this.db
                    .collection(ASSET_COLLECTION_NAME)
                    .doc(updateItem.assetId)
                    .collection(HOLDERS_COLLECTION_NAME)
                    .doc(updateItem.portfolioId);
                const deltaUnits = FieldValue.increment(updateItem.deltaUnits);
                const deltaNet = FieldValue.increment(updateItem.deltaNet);
                const deltaCost = FieldValue.increment(updateItem.deltaCost);
                return {
                    ref: entityRef,
                    cache: cacheRef,
                    holder: assetHolderRef,
                    deltaUnits,
                    deltaNet,
                    deltaCost,
                };
            });
            const activityMap = new Map();
            updateSet.forEach((updateItem) => {
                const portfolioId = updateItem.portfolioId;
                if (!activityMap.get(portfolioId)) {
                    const entityRef = this.db
                        .collection(COLLECTION_NAME)
                        .doc(updateItem.portfolioId)
                        .collection(ACTIVITY_COLLECTION_NAME)
                        .doc(transactionId);
                    activityMap.set(portfolioId, { ref: entityRef, transaction });
                }
            });
            const activity = Array.from(activityMap.values());
            // execute the batch of writes as an atomic set.
            const batch = this.db.batch();
            updates.forEach((item) => {
                // update portfolios.holdings
                batch.update(item.ref, { units: item.deltaUnits, net: item.deltaNet, cost: item.deltaCost });
                // update portfolioCache.holdings
                batch.update(item.cache, { units: item.deltaUnits });
                // update assets.holders
                batch.update(item.holder, { units: item.deltaUnits });
            });
            activity.forEach((item) => {
                const jsonData = JSON.parse(JSON.stringify(item.transaction));
                batch.set(item.ref, jsonData);
            });
            yield batch.commit();
        });
    }
}
exports.PortfolioActivityRepository = PortfolioActivityRepository;
