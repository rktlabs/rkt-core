import * as admin from 'firebase-admin'
import * as log4js from 'log4js'
import { generateId } from '../..'
import { TAssetHolderUpdateItem, TActivity, TTransaction } from '../../models'
import { getConnectionProps } from '../getConnectionProps'
import { RepositoryBase } from '../repositoryBase'

const logger = log4js.getLogger('AssetActivityRepository')

const FieldValue = admin.firestore.FieldValue

const ACTIVITY_COLLECTION_NAME = 'activity'

const PORTFOLIO_COLLECTION_NAME = 'portfolios'
const HOLDINGS_COLLECTION_NAME = 'holdings'

const ASSET_COLLECTION_NAME = 'assets'
const HOLDERS_COLLECTION_NAME = 'holders'

export class ActivityRepository extends RepositoryBase {
    db: FirebaseFirestore.Firestore
    constructor() {
        super()
        this.db = getConnectionProps()
    }

    filterMap: any = {
        portfolioId: 'portfilioId',
        assetId: 'assetId',
        source: 'source',
        transactionId: 'transactionId',
        orderId: 'orderId',
        tradeId: 'tradeId',
    }

    async getPortfolioListAsync(portfolioId: string, qs?: any) {
        const newqs = { ...qs, portfolioId: portfolioId }
        return this.getListAsync(newqs)
    }

    async getAssetListAsync(assetId: string, qs?: any) {
        const newqs = { ...qs, assetId: assetId }
        return this.getListAsync(newqs)
    }

    async getPortfolioAssetListAsync(portfolioId: string, assetId: string, qs?: any) {
        const newqs = { ...qs, portfolioId: portfolioId, assetId: assetId }
        return this.getListAsync(newqs)
    }

    async getListAsync(qs?: any) {
        let entityRefCollection: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> =
            this.db.collection(ACTIVITY_COLLECTION_NAME)

        entityRefCollection = this.generateFilterPredicate(qs, this.filterMap, entityRefCollection)
        entityRefCollection = this.generatePagingProperties(qs, entityRefCollection, 'createdAt')
        const entityCollectionRefs = await entityRefCollection.get()

        const entityList = entityCollectionRefs.docs.map((entityDoc) => {
            const entity = entityDoc.data() as TTransaction
            return entity
        })

        return entityList
    }

    async atomicUpdateTransactionAsync(updateSet: TAssetHolderUpdateItem[], transaction: TTransaction) {
        logger.trace(`update holdings`, updateSet)
        // compile the refs and increments (outside of batch)

        const updates = updateSet.map((updateItem: TAssetHolderUpdateItem) => {
            const deltaUnits = updateItem.deltaUnits
            const assetId = updateItem.assetId
            const portfolioId = updateItem.portfolioId
            const units = updateItem.deltaUnits
            const value = updateItem.deltaValue

            const transactionId = transaction.transactionId
            const createdAt = transaction.createdAt
            const orderId = transaction.xids?.orderId
            const orderPortfolioId = transaction.xids?.orderPortfolioId
            const source = transaction.tags?.source
            const tradeId = transaction.xids?.tradeId

            // TODO: Let firestore generate Id
            const activityId = generateId()

            const portfolioHoldingRef = this.db
                .collection(PORTFOLIO_COLLECTION_NAME)
                .doc(portfolioId)
                .collection(HOLDINGS_COLLECTION_NAME)
                .doc(assetId)

            const activityRef = this.db.collection(ACTIVITY_COLLECTION_NAME).doc(activityId)

            const assetHolderRef = this.db
                .collection(ASSET_COLLECTION_NAME)
                .doc(assetId)
                .collection(HOLDERS_COLLECTION_NAME)
                .doc(portfolioId)

            const activityItem: TActivity = {
                createdAt: createdAt,
                assetId: assetId,
                portfolioId: portfolioId,
                units: units,
                transactionId: transactionId,
            }

            if (value) activityItem.value = value
            if (orderId) activityItem.orderId = orderId
            if (orderPortfolioId) activityItem.orderPortfolioId = orderPortfolioId
            if (source) activityItem.source = source
            if (tradeId) activityItem.tradeId = tradeId

            return {
                portfolioHoldingRef: portfolioHoldingRef,
                assetHolderRef: assetHolderRef,
                activityRef: activityRef,
                deltaUnits,
                activityItem,
            }
        })

        // execute the batch of writes as an atomic set.
        const batch = this.db.batch()
        updates.forEach((item) => {
            // update assets.holders
            batch.update(item.portfolioHoldingRef, { units: FieldValue.increment(item.deltaUnits) })

            // update assets.holders
            batch.update(item.assetHolderRef, { units: FieldValue.increment(item.deltaUnits) })

            // update assets.activity
            batch.set(item.activityRef, item.activityItem)
        })

        await batch.commit()
    }
}
