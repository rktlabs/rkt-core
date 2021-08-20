'use strict'
'use strict'
import { TPortfolioAsset, TPortfolioAssetCache } from '..'
import { deleteDocument } from '../util/deleters'
import { IRepository } from './IRepository'

const COLLECTION_NAME = 'portfolios'
const CACHE_NAME = 'portfolioCache'
const SUB_COLLECTION_NAME = 'holdings'

export class PortfolioAssetRepository implements IRepository {
    db: FirebaseFirestore.Firestore
    constructor(db: FirebaseFirestore.Firestore) {
        this.db = db
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

        // cache holding
        const cacheData: TPortfolioAssetCache = {
            portfolioId: entityData.portfolioId,
            assetId: entityData.assetId,
            units: 0,
        }
        const cacheRef = this.db.collection(CACHE_NAME).doc(portfolioId).collection(SUB_COLLECTION_NAME).doc(assetId)
        await cacheRef.set(cacheData)
    }

    async deletePortfolioAsset(portfolioId: string, assetId: string) {
        const entityRef = this.db
            .collection(COLLECTION_NAME)
            .doc(portfolioId)
            .collection(SUB_COLLECTION_NAME)
            .doc(assetId)

        await deleteDocument(entityRef)

        // clear cache
        const cacheRef = this.db.collection(CACHE_NAME).doc(portfolioId).collection(SUB_COLLECTION_NAME).doc(assetId)

        await deleteDocument(cacheRef)
    }
}
