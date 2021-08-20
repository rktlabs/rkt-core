'use strict'
import { TPortfolioAssetCache } from '..'
import { ICache } from './ICache'

const COLLECTION_NAME = 'portfolioCache'
const SUB_COLLECTION_NAME = 'holdings'

export class PortfolioAssetCache implements ICache {
    db: FirebaseFirestore.Firestore
    constructor(db: FirebaseFirestore.Firestore) {
        this.db = db
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
        const entity = entityDoc.data() as TPortfolioAssetCache
        return entity
    }
}
