import * as admin from 'firebase-admin'
import * as log4js from 'log4js'
import { TAssetHolderUpdateItem, TPortfolioActivity, TTransaction } from '../../models'
import { deleteCollection } from '../../util/deleters'
import { getConnectionProps } from '../getConnectionProps'
import { RepositoryBase } from '../repositoryBase'

const logger = log4js.getLogger('portfolioRepository')

const FieldValue = admin.firestore.FieldValue

const PORTFOLIO_COLLECTION_NAME = 'portfolios'
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
            .collection(PORTFOLIO_COLLECTION_NAME)
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
        const entityRef = this.db
            .collection(PORTFOLIO_COLLECTION_NAME)
            .doc(portfolioId)
            .collection(ACTIVITY_COLLECTION_NAME)
        await deleteCollection(entityRef)
    }

    async atomicUpdateTransactionAsync(updateSet: TAssetHolderUpdateItem[], transaction: TTransaction) {
        logger.trace(`update holdings`, updateSet)
        // compile the refs and increments (outside of batch)

        const updates = updateSet.map((updateItem: TAssetHolderUpdateItem) => {
            const deltaUnits = FieldValue.increment(updateItem.deltaUnits)
            const assetId = updateItem.assetId
            const portfolioId = updateItem.portfolioId
            const units = updateItem.deltaUnits

            const transactionId = transaction.transactionId
            const createdAt = transaction.createdAt
            const orderId = transaction.xids?.orderId
            const orderPortfolioId = transaction.xids?.orderPortfolioId

            const portfolioHoldingRef = this.db
                .collection(PORTFOLIO_COLLECTION_NAME)
                .doc(portfolioId)
                .collection(HOLDINGS_COLLECTION_NAME)
                .doc(assetId)

            const assetHolderRef = this.db
                .collection(ASSET_COLLECTION_NAME)
                .doc(assetId)
                .collection(HOLDERS_COLLECTION_NAME)
                .doc(portfolioId)

            const portfolioActivityRef = this.db
                .collection(PORTFOLIO_COLLECTION_NAME)
                .doc(portfolioId)
                .collection(ACTIVITY_COLLECTION_NAME)
                .doc(transactionId)

            return {
                portfolioHoldingRef: portfolioHoldingRef,
                assetHolderRef: assetHolderRef,
                portfolioActivityRef: portfolioActivityRef,
                assetId,
                deltaUnits,
                units,
                transactionId,
                createdAt,
                orderId,
                orderPortfolioId,
            }
        })

        // execute the batch of writes as an atomic set.
        const batch = this.db.batch()
        updates.forEach((item) => {
            // update portfolios.holdings
            batch.update(item.portfolioHoldingRef, { units: item.deltaUnits })

            // update assets.holders
            batch.update(item.assetHolderRef, { units: item.deltaUnits })

            const activityItem: TPortfolioActivity = {
                createdAt: item.createdAt,
                assetId: item.assetId,
                units: item.units,
                transactionId: item.transactionId,
            }
            if (item.orderId) activityItem.orderId = item.orderId
            if (item.orderPortfolioId) activityItem.orderPortfolioId = item.orderPortfolioId

            // update assets.holders
            batch.set(item.portfolioActivityRef, activityItem)
        })

        await batch.commit()
    }
}
