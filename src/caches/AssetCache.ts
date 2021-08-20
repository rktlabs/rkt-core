'use strict'
import { TAssetCache } from '../models'
import { ICache } from './ICache'

const COLLECTION_NAME = 'assetCache'

export class AssetCache implements ICache {
    db: FirebaseFirestore.Firestore
    constructor(db: FirebaseFirestore.Firestore) {
        this.db = db
    }

    async lookupAsset(assetId: string) {
        const entityRef = this.db.collection(COLLECTION_NAME).doc(assetId)
        const entityDoc = await entityRef.get()
        if (!entityDoc.exists) {
            return null
        } else {
            const entity = entityDoc.data()
            if (entity) {
                const asset: TAssetCache = {
                    assetId: entity.assetId || entity.id, // EJH NOTE: Some cache items have no assetId. use id
                    symbol: entity.symbol,
                    type: entity.type,
                    portfolioId: entity.portfolioId,
                    contractId: entity.contractId,
                    cumulativeEarnings: entity.cumulativeEarnings,
                }
                return asset
            } else {
                return null
            }
        }
    }
}
