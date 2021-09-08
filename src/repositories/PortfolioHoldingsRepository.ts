'use strict'
import { TPortfolioHolding } from '..'
import { deleteDocument } from '../util/deleters'
import { getConnectionProps } from './getConnectionProps'
import { RepositoryBase } from './repositoryBase'

const COLLECTION_NAME = 'portfolios'
const SUB_COLLECTION_NAME = 'holdings'

export class PortfolioHoldingsRepository extends RepositoryBase {
    db: FirebaseFirestore.Firestore
    constructor() {
        super()
        this.db = getConnectionProps()
    }

    async listPortfolioHoldings(portfolioId: string) {
        const entityCollectionRef = this.db.collection(COLLECTION_NAME).doc(portfolioId).collection(SUB_COLLECTION_NAME)
        const entityRefCollection = await entityCollectionRef.limit(1000).get()
        const entityList = entityRefCollection.docs.map((entityDoc) => {
            const entity = entityDoc.data() as TPortfolioHolding
            return entity
        })

        return entityList
    }

    async getPortfolioHolding(portfolioId: string, assetId: string) {
        const entityRef = this.db
            .collection(COLLECTION_NAME)
            .doc(portfolioId)
            .collection(SUB_COLLECTION_NAME)
            .doc(assetId)
        const entityDoc = await entityRef.get()
        if (!entityDoc.exists) {
            return null
        }

        const entity = entityDoc.data() as TPortfolioHolding
        return entity
    }

    async storePortfolioHolding(portfolioId: string, assetId: string, entity: TPortfolioHolding) {
        const entityData = JSON.parse(JSON.stringify(entity))
        const entityRef = this.db
            .collection(COLLECTION_NAME)
            .doc(portfolioId)
            .collection(SUB_COLLECTION_NAME)
            .doc(assetId)
        await entityRef.set(entityData)
    }

    async deletePortfolioHolding(portfolioId: string, assetId: string) {
        const entityRef = this.db
            .collection(COLLECTION_NAME)
            .doc(portfolioId)
            .collection(SUB_COLLECTION_NAME)
            .doc(assetId)

        await deleteDocument(entityRef)
    }
}
