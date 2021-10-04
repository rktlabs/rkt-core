import * as admin from 'firebase-admin'
import * as log4js from 'log4js'
import { generateId } from '../..'
import { TActivityUpdateItem, TActivity, TTransaction } from '../../models'
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

    async atomicUpdateTransactionAsync(updateSet: TActivityUpdateItem[], transaction: TTransaction) {
        logger.trace(`update holdings`, updateSet)
        // compile the refs and increments (outside of batch)

        const updates = updateSet.map((updateItem: TActivityUpdateItem) => {
            const deltaUnits = updateItem.deltaUnits
            const deltaValue = updateItem.deltaValue
            const assetId = updateItem.assetId
            const portfolioId = updateItem.portfolioId

            const createdAt = transaction.createdAt
            const transactionId = transaction.transactionId
            const source = transaction.tags?.source
            const refTradeId = transaction.xids?.tradeId
            const refOrderId = transaction.xids?.orderId
            const refOrderPortfolioId = transaction.xids?.orderPortfolioId

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
                deltaUnits: deltaUnits,
                deltaValue: deltaValue,
                transactionId: transactionId,
            }

            if (source) activityItem.source = source
            if (refOrderId) activityItem.refOrderId = refOrderId
            if (refOrderPortfolioId) activityItem.refOrderPortfolioId = refOrderPortfolioId
            if (refTradeId) activityItem.refTradeId = refTradeId

            return {
                portfolioHoldingRef: portfolioHoldingRef,
                assetHolderRef: assetHolderRef,
                activityRef: activityRef,
                deltaUnits,
                deltaValue,
                activityItem,
            }
        })

        // execute the batch of writes as an atomic set.
        const batch = this.db.batch()
        updates.forEach((item) => {
            // update assets.holders
            batch.update(item.portfolioHoldingRef, {
                units: FieldValue.increment(item.deltaUnits),
                netValue: FieldValue.increment(item.deltaValue || 0),
            })

            // update assets.holders
            batch.update(item.assetHolderRef, {
                units: FieldValue.increment(item.deltaUnits),
                netValue: FieldValue.increment(item.deltaValue || 0),
            })

            // update assets.activity
            batch.set(item.activityRef, item.activityItem)
        })

        await batch.commit()
    }
}
