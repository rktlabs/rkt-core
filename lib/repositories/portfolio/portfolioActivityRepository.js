"use strict";
// import { TTransaction } from '../../models'
// import { getConnectionProps } from '../getConnectionProps'
// import { RepositoryBase } from '../repositoryBase'
// const PORTFOLIO_COLLECTION_NAME = 'portfolios'
// const HOLDING_ACTIVITY_COLLECTION_NAME = 'activity'
// export class PortfolioActivityRepository extends RepositoryBase {
//     db: FirebaseFirestore.Firestore
//     constructor() {
//         super()
//         this.db = getConnectionProps()
//     }
//     filterMap: any = {
//         assetId: 'assetId',
//         source: 'source',
//         transactionId: 'transactionId',
//         orderId: 'orderId',
//         tradeId: 'tradeId',
//     }
//     async getListAsync(portfolioId: string, qs?: any) {
//         let entityRefCollection: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = this.db
//             .collection(PORTFOLIO_COLLECTION_NAME)
//             .doc(portfolioId)
//             .collection(HOLDING_ACTIVITY_COLLECTION_NAME)
//         entityRefCollection = this.generateFilterPredicate(qs, this.filterMap, entityRefCollection)
//         entityRefCollection = this.generatePagingProperties(qs, entityRefCollection, 'createdAt')
//         const entityCollectionRefs = await entityRefCollection.get()
//         const entityList = entityCollectionRefs.docs.map((entityDoc) => {
//             const entity = entityDoc.data() as TTransaction
//             return entity
//         })
//         return entityList
//     }
// }
