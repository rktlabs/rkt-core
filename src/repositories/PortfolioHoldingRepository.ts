'use strict'
import { TPortfolioAsset } from '..'
import { deleteDocument } from '../util/deleters'
import { getConnectionProps } from './getConnectionProps'
import { RepositoryBase } from './repositoryBase'

const COLLECTION_NAME = 'portfolios'
const SUB_COLLECTION_NAME = 'holdings'

export class PortfolioHoldingRepository extends RepositoryBase {
    db: FirebaseFirestore.Firestore
    constructor() {
        super()
        this.db = getConnectionProps()
    }

    async listPortfolioAssets(portfolioId: string) {
        const entityCollectionRef = this.db.collection(COLLECTION_NAME).doc(portfolioId).collection(SUB_COLLECTION_NAME)
        const entityRefCollection = await entityCollectionRef.limit(1000).get()
        const entityList = entityRefCollection.docs.map((entityDoc) => {
            const entity = entityDoc.data() as TPortfolioAsset
            return entity
        })

        return entityList
    }

    async getPortfolioAsset(portfolioId: string, assetId: string) {
        const entityRef = this.db
            .collection(COLLECTION_NAME)
            .doc(portfolioId)
            .collection(SUB_COLLECTION_NAME)
            .doc(assetId)
        const entityDoc = await entityRef.get()
        if (!entityDoc.exists) {
            return null
        }

        const entity = entityDoc.data() as TPortfolioAsset
        return entity
    }

    async storePortfolioAsset(portfolioId: string, assetId: string, entity: TPortfolioAsset) {
        const entityData = JSON.parse(JSON.stringify(entity))
        const entityRef = this.db
            .collection(COLLECTION_NAME)
            .doc(portfolioId)
            .collection(SUB_COLLECTION_NAME)
            .doc(assetId)
        await entityRef.set(entityData)
    }

    async deletePortfolioAsset(portfolioId: string, assetId: string) {
        const entityRef = this.db
            .collection(COLLECTION_NAME)
            .doc(portfolioId)
            .collection(SUB_COLLECTION_NAME)
            .doc(assetId)

        await deleteDocument(entityRef)
    }
}
