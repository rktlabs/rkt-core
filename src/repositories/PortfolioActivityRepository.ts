import { TPortfolioAssetUpdateItem, TTransaction } from '../models'
import { deleteCollection } from '../util/deleters'
import { IRepository } from './IRepository'

import * as admin from 'firebase-admin'
const FieldValue = admin.firestore.FieldValue

const COLLECTION_NAME = 'portfolios'
const HOLDINGS_COLLECTION_NAME = 'holdings'
const ACTIVITY_COLLECTION_NAME = 'activity'

const PORTFOLIO_CACHE = 'portfolioCache'

const ASSET_COLLECTION_NAME = 'assets'
const HOLDERS_COLLECTION_NAME = 'holders'

export class PortfolioActivityRepository implements IRepository {
    db: FirebaseFirestore.Firestore

    constructor(dataSource: FirebaseFirestore.Firestore) {
        this.db = dataSource
    }

    async listPortfolioActivity(portfolioId: string) {
        const entityCollectionRef = this.db
            .collection(COLLECTION_NAME)
            .doc(portfolioId)
            .collection(ACTIVITY_COLLECTION_NAME)
        const entityRefCollection = await entityCollectionRef.limit(1000).get()

        const entityList = entityRefCollection.docs.map((entityDoc) => {
            const entity = entityDoc.data() as TTransaction
            return entity
        })

        return entityList
    }

    async scrubPortfolioActivityCollection(portfolioId: string) {
        const entityRef = this.db.collection(COLLECTION_NAME).doc(portfolioId).collection(ACTIVITY_COLLECTION_NAME)
        await deleteCollection(entityRef)
    }

    async atomicUpdateTransaction(
        transactionId: string,
        updateSet: TPortfolioAssetUpdateItem[],
        transaction: TTransaction,
    ) {
        // compile the refs and increments (outside of batch)
        const updates = updateSet.map((updateItem: TPortfolioAssetUpdateItem) => {
            const entityRef = this.db
                .collection(COLLECTION_NAME)
                .doc(updateItem.portfolioId)
                .collection(HOLDINGS_COLLECTION_NAME)
                .doc(updateItem.assetId)

            const cacheRef = this.db
                .collection(PORTFOLIO_CACHE)
                .doc(updateItem.portfolioId)
                .collection(HOLDINGS_COLLECTION_NAME)
                .doc(updateItem.assetId)

            const assetHolderRef = this.db
                .collection(ASSET_COLLECTION_NAME)
                .doc(updateItem.assetId)
                .collection(HOLDERS_COLLECTION_NAME)
                .doc(updateItem.portfolioId)

            const deltaUnits = FieldValue.increment(updateItem.deltaUnits)
            const deltaNet = FieldValue.increment(updateItem.deltaNet)
            const deltaCost = FieldValue.increment(updateItem.deltaCost)
            return {
                ref: entityRef,
                cache: cacheRef,
                holder: assetHolderRef,
                deltaUnits,
                deltaNet,
                deltaCost,
            }
        })

        const activityMap = new Map()

        updateSet.forEach((updateItem: TPortfolioAssetUpdateItem) => {
            const portfolioId = updateItem.portfolioId
            if (!activityMap.get(portfolioId)) {
                const entityRef = this.db
                    .collection(COLLECTION_NAME)
                    .doc(updateItem.portfolioId)
                    .collection(ACTIVITY_COLLECTION_NAME)
                    .doc(transactionId)
                activityMap.set(portfolioId, { ref: entityRef, transaction })
            }
        })

        const activity = Array.from(activityMap.values())

        // execute the batch of writes as an atomic set.
        const batch = this.db.batch()
        updates.forEach((item) => {
            // update portfolios.holdings
            batch.update(item.ref, { units: item.deltaUnits, net: item.deltaNet, cost: item.deltaCost })
            // update portfolioCache.holdings
            batch.update(item.cache, { units: item.deltaUnits })
            // update assets.holders
            batch.update(item.holder, { units: item.deltaUnits })
        })

        activity.forEach((item) => {
            const jsonData = JSON.parse(JSON.stringify(item.transaction))
            batch.set(item.ref, jsonData)
        })

        await batch.commit()
    }
}
