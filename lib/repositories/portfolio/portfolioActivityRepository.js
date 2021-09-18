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
const deleters_1 = require("../../util/deleters");
const admin = require("firebase-admin");
const getConnectionProps_1 = require("../getConnectionProps");
const repositoryBase_1 = require("../repositoryBase");
const FieldValue = admin.firestore.FieldValue;
const COLLECTION_NAME = 'portfolios';
const HOLDINGS_COLLECTION_NAME = 'holdings';
const ACTIVITY_COLLECTION_NAME = 'activity';
const ASSET_COLLECTION_NAME = 'assets';
const HOLDERS_COLLECTION_NAME = 'holders';
class PortfolioActivityRepository extends repositoryBase_1.RepositoryBase {
    constructor() {
        super();
        this.filterMap = {
            leagueId: 'leagueId',
            type: 'type',
        };
        this.db = (0, getConnectionProps_1.getConnectionProps)();
    }
    getListAsync(portfolioId, qs) {
        return __awaiter(this, void 0, void 0, function* () {
            let entityRefCollection = this.db
                .collection(COLLECTION_NAME)
                .doc(portfolioId)
                .collection(ACTIVITY_COLLECTION_NAME);
            entityRefCollection = this.generateFilterPredicate(qs, this.filterMap, entityRefCollection);
            entityRefCollection = this.generatePagingProperties(qs, entityRefCollection);
            const entityCollectionRefs = yield entityRefCollection.get();
            const entityList = entityCollectionRefs.docs.map((entityDoc) => {
                const entity = entityDoc.data();
                return entity;
            });
            return entityList;
        });
    }
    scrubCollectionAsync(portfolioId) {
        return __awaiter(this, void 0, void 0, function* () {
            const entityRef = this.db.collection(COLLECTION_NAME).doc(portfolioId).collection(ACTIVITY_COLLECTION_NAME);
            yield (0, deleters_1.deleteCollection)(entityRef);
        });
    }
    atomicUpdateTransactionAsync(transactionId, updateSet, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            // compile the refs and increments (outside of batch)
            const updates = updateSet.map((updateItem) => {
                const portfolioHoldingRef = this.db
                    .collection(COLLECTION_NAME)
                    .doc(updateItem.portfolioId)
                    .collection(HOLDINGS_COLLECTION_NAME)
                    .doc(updateItem.assetId);
                const assetHolderRef = this.db
                    .collection(ASSET_COLLECTION_NAME)
                    .doc(updateItem.assetId)
                    .collection(HOLDERS_COLLECTION_NAME)
                    .doc(updateItem.portfolioId);
                // bit of a hack here for now, but want to update asset unitsIssued, but ONLY
                // if the portfolio for the update is the assets portfolio
                let assetRef = null;
                if (updateItem.portfolioId == `asset::${updateItem.assetId}`) {
                    assetRef = this.db.collection(ASSET_COLLECTION_NAME).doc(updateItem.assetId);
                }
                const deltaUnits = FieldValue.increment(updateItem.deltaUnits);
                // const deltaNet = FieldValue.increment(updateItem.deltaNet)
                // const deltaCost = FieldValue.increment(updateItem.deltaCost)
                return {
                    portfolioHoldingRef: portfolioHoldingRef,
                    assetHolderRef: assetHolderRef,
                    assetRef: assetRef,
                    deltaUnits,
                    // deltaNet,
                    // deltaCost,
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
                    activityMap.set(portfolioId, { portfolioActivityRef: entityRef, transaction });
                }
            });
            const activity = Array.from(activityMap.values());
            // execute the batch of writes as an atomic set.
            const batch = this.db.batch();
            updates.forEach((item) => {
                // update portfolios.holdings
                batch.update(item.portfolioHoldingRef, { units: item.deltaUnits });
                // update assets.holders
                batch.update(item.assetHolderRef, { units: item.deltaUnits });
                // update asset unitsIssued
                if (item.assetRef) {
                    batch.update(item.assetRef, { issuedUnits: item.deltaUnits });
                }
            });
            activity.forEach((item) => {
                const jsonData = JSON.parse(JSON.stringify(item.transaction));
                batch.set(item.portfolioActivityRef, jsonData);
            });
            yield batch.commit();
        });
    }
}
exports.PortfolioActivityRepository = PortfolioActivityRepository;
