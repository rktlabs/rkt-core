import { TAssetHolderUpdateItem, TTransaction } from '../../models'
import { deleteCollection } from '../../util/deleters'

import * as admin from 'firebase-admin'
import { getConnectionProps } from '../getConnectionProps'
import { RepositoryBase } from '../repositoryBase'
const FieldValue = admin.firestore.FieldValue

const COLLECTION_NAME = 'portfolios'
const HOLDINGS_COLLECTION_NAME = 'holdings'
const ACTIVITY_COLLECTION_NAME = 'activity'

const ASSET_COLLECTION_NAME = 'assets'
const HOLDERS_COLLECTION_NAME = 'holders'

export class PortfolioActivityRepository extends RepositoryBase {
    db: FirebaseFirestore.Firestore
    constructor() {
        super()
        this.db = getConnectionProps()
    }

    filterMap: any = {
        leagueId: 'leagueId',
        type: 'type',
    }

    async getListAsync(portfolioId: string, qs?: any) {
        let entityRefCollection: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = this.db
            .collection(COLLECTION_NAME)
            .doc(portfolioId)
            .collection(ACTIVITY_COLLECTION_NAME)

        entityRefCollection = this.generateFilterPredicate(qs, this.filterMap, entityRefCollection)
        entityRefCollection = this.generatePagingProperties(qs, entityRefCollection)
        const entityCollectionRefs = await entityRefCollection.get()

        const entityList = entityCollectionRefs.docs.map((entityDoc) => {
            const entity = entityDoc.data() as TTransaction
            return entity
        })

        return entityList
    }

    async scrubCollectionAsync(portfolioId: string) {
        const entityRef = this.db.collection(COLLECTION_NAME).doc(portfolioId).collection(ACTIVITY_COLLECTION_NAME)
        await deleteCollection(entityRef)
    }

    async atomicUpdateTransactionAsync(
        transactionId: string,
        updateSet: TAssetHolderUpdateItem[],
        transaction: TTransaction,
    ) {
        // compile the refs and increments (outside of batch)
        const updates = updateSet.map((updateItem: TAssetHolderUpdateItem) => {
            const portfolioHoldingRef = this.db
                .collection(COLLECTION_NAME)
                .doc(updateItem.portfolioId)
                .collection(HOLDINGS_COLLECTION_NAME)
                .doc(updateItem.assetId)

            const assetHolderRef = this.db
                .collection(ASSET_COLLECTION_NAME)
                .doc(updateItem.assetId)
                .collection(HOLDERS_COLLECTION_NAME)
                .doc(updateItem.portfolioId)

            const deltaUnits = FieldValue.increment(updateItem.deltaUnits)
            return {
                portfolioHoldingRef: portfolioHoldingRef,
                assetHolderRef: assetHolderRef,
                deltaUnits,
            }
        })

        const activityMap = new Map()

        updateSet.forEach((updateItem: TAssetHolderUpdateItem) => {
            const portfolioId = updateItem.portfolioId
            if (!activityMap.get(portfolioId)) {
                const entityRef = this.db
                    .collection(COLLECTION_NAME)
                    .doc(updateItem.portfolioId)
                    .collection(ACTIVITY_COLLECTION_NAME)
                    .doc(transactionId)
                activityMap.set(portfolioId, { portfolioActivityRef: entityRef, transaction })
            }
        })

        const activity = Array.from(activityMap.values())

        // execute the batch of writes as an atomic set.
        const batch = this.db.batch()
        updates.forEach((item) => {
            // update portfolios.holdings
            batch.update(item.portfolioHoldingRef, { units: item.deltaUnits })

            // update assets.holders
            batch.update(item.assetHolderRef, { units: item.deltaUnits })
        })

        activity.forEach((item) => {
            const jsonData = JSON.parse(JSON.stringify(item.transaction))
            batch.set(item.portfolioActivityRef, jsonData)
        })

        await batch.commit()
    }
}
