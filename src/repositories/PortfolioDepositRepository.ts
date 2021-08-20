'use strict'
'use strict'
import { TPortfolioDeposit } from '..'
import { deleteCollection } from '../util/deleters'
import { IRepository } from './IRepository'

const COLLECTION_NAME = 'portfolios'
const SUB_COLLECTION_NAME = 'funding'

export class PortfolioDepositRepository implements IRepository {
    db: FirebaseFirestore.Firestore
    constructor(db: FirebaseFirestore.Firestore) {
        this.db = db
    }

    async listPortfolioDeposits(portfolioId: string) {
        const entityCollectionRef = this.db.collection(COLLECTION_NAME).doc(portfolioId).collection(SUB_COLLECTION_NAME)
        const entityRefCollection = await entityCollectionRef.limit(1000).get()
        const entityList = entityRefCollection.docs.map((entityDoc) => {
            const entity = entityDoc.data() as TPortfolioDeposit
            return entity
        })

        return entityList
    }

    // async getPortfolioDeposit(portfolioId: string, assetId: string) {
    //     const entityRef = this.db
    //         .collection(COLLECTION_NAME)
    //         .doc(portfolioId)
    //         .collection(SUB_COLLECTION_NAME)
    //         .doc(assetId)
    //     const entityDoc = await entityRef.get()
    //     if (!entityDoc.exists) {
    //         return null
    //     }

    //     const entity = entityDoc.data() as TPortfolioDeposit
    //     return entity
    // }

    async storePortfolioDeposit(portfolioId: string, entity: TPortfolioDeposit) {
        const entityData = JSON.parse(JSON.stringify(entity))
        const entityRef = this.db.collection(COLLECTION_NAME).doc(portfolioId).collection(SUB_COLLECTION_NAME)
        await entityRef.add(entityData)
    }

    // async deletePortfolioDeposit(portfolioId: string, assetId: string) {
    //     const entityRef = this.db
    //         .collection(COLLECTION_NAME)
    //         .doc(portfolioId)
    //         .collection(SUB_COLLECTION_NAME)
    //         .doc(assetId)

    //     await deleteDocument(entityRef)
    // }

    async scrubPortfolioDeposits(portfolioId: string) {
        const entityRef = this.db.collection(COLLECTION_NAME).doc(portfolioId).collection(SUB_COLLECTION_NAME)
        await deleteCollection(entityRef)
    }
}
