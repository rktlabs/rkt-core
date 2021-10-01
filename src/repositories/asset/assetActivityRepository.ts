// import * as admin from 'firebase-admin'
// import * as log4js from 'log4js'
// import { generateId } from '../..'
// import { TAssetHolderUpdateItem, TPortfolioActivity, TTransaction } from '../../models'
// import { getConnectionProps } from '../getConnectionProps'
// import { RepositoryBase } from '../repositoryBase'

// const logger = log4js.getLogger('AssetActivityRepository')

// const FieldValue = admin.firestore.FieldValue

// const PORTFOLIO_COLLECTION_NAME = 'portfolios'
// const HOLDINGS_COLLECTION_NAME = 'holdings'
// const PORTFOLIO_ACTIVITY_COLLECTION_NAME = 'activity'

// const ASSET_COLLECTION_NAME = 'assets'
// const HOLDERS_COLLECTION_NAME = 'holders'
// const ASSET_ACTIVITY_COLLECTION_NAME = 'activity'

// export class AssetActivityRepository extends RepositoryBase {
//     db: FirebaseFirestore.Firestore
//     constructor() {
//         super()
//         this.db = getConnectionProps()
//     }

//     filterMap: any = {
//         portfolioId: 'portfilioId',
//         assetId: 'assetId',
//         source: 'source',
//         transactionId: 'transactionId',
//         orderId: 'orderId',
//         tradeId: 'tradeId',
//     }

//     async getListAsync(assetId: string, qs?: any) {
//         let entityRefCollection: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = this.db
//             .collection(ASSET_COLLECTION_NAME)
//             .doc(assetId)
//             .collection(ASSET_ACTIVITY_COLLECTION_NAME)

//         entityRefCollection = this.generateFilterPredicate(qs, this.filterMap, entityRefCollection)
//         entityRefCollection = this.generatePagingProperties(qs, entityRefCollection, 'createdAt')
//         const entityCollectionRefs = await entityRefCollection.get()

//         const entityList = entityCollectionRefs.docs.map((entityDoc) => {
//             const entity = entityDoc.data() as TTransaction
//             return entity
//         })

//         return entityList
//     }

//     async atomicUpdateTransactionAsync(updateSet: TAssetHolderUpdateItem[], transaction: TTransaction) {
//         logger.trace(`update holdings`, updateSet)
//         // compile the refs and increments (outside of batch)

//         const updates = updateSet.map((updateItem: TAssetHolderUpdateItem) => {
//             const deltaUnits = FieldValue.increment(updateItem.deltaUnits)
//             const assetId = updateItem.assetId
//             const portfolioId = updateItem.portfolioId
//             const units = updateItem.deltaUnits
//             const transactionId = transaction.transactionId
//             const createdAt = transaction.createdAt
//             const orderId = transaction.xids?.orderId
//             const orderPortfolioId = transaction.xids?.orderPortfolioId
//             const source = transaction.tags?.source
//             const tradeId = transaction.xids?.tradeId

//             // TODO: Let firestore generate Id
//             const activityId = generateId()

//             const portfolioHoldingRef = this.db
//                 .collection(PORTFOLIO_COLLECTION_NAME)
//                 .doc(portfolioId)
//                 .collection(HOLDINGS_COLLECTION_NAME)
//                 .doc(assetId)

//             const portfolioActivityRef = this.db
//                 .collection(PORTFOLIO_COLLECTION_NAME)
//                 .doc(portfolioId)
//                 .collection(PORTFOLIO_ACTIVITY_COLLECTION_NAME)
//                 .doc(activityId)

//             const assetHolderRef = this.db
//                 .collection(ASSET_COLLECTION_NAME)
//                 .doc(assetId)
//                 .collection(HOLDERS_COLLECTION_NAME)
//                 .doc(portfolioId)

//             const assetActivityRef = this.db
//                 .collection(ASSET_COLLECTION_NAME)
//                 .doc(assetId)
//                 .collection(ASSET_ACTIVITY_COLLECTION_NAME)
//                 .doc(activityId)

//             const activityItem: TPortfolioActivity = {
//                 createdAt: createdAt,
//                 assetId: assetId,
//                 portfolioId: portfolioId,
//                 units: units,
//                 transactionId: transactionId,
//             }

//             if (orderId) activityItem.orderId = orderId
//             if (orderPortfolioId) activityItem.orderPortfolioId = orderPortfolioId
//             if (source) activityItem.source = source
//             if (tradeId) activityItem.tradeId = tradeId

//             return {
//                 portfolioHoldingRef: portfolioHoldingRef,
//                 portfolioActivityRef: portfolioActivityRef,
//                 assetHolderRef: assetHolderRef,
//                 assetActivityRef: assetActivityRef,
//                 deltaUnits,
//                 activityItem,
//             }
//         })

//         // execute the batch of writes as an atomic set.
//         const batch = this.db.batch()
//         updates.forEach((item) => {
//             // update assets.holders
//             batch.update(item.portfolioHoldingRef, { units: item.deltaUnits })

//             // update assets.activity
//             batch.set(item.portfolioActivityRef, item.activityItem)

//             // update assets.holders
//             batch.update(item.assetHolderRef, { units: item.deltaUnits })

//             // update assets.activity
//             batch.set(item.assetActivityRef, item.activityItem)
//         })

//         await batch.commit()
//     }
// }
