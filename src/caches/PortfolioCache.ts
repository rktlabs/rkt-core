'use strict'
import { ICache } from './ICache'
import { TPortfolioCache } from '../models'

const COLLECTION_NAME = 'portfolioCache'

export class PortfolioCache implements ICache {
    db: FirebaseFirestore.Firestore
    constructor(db: FirebaseFirestore.Firestore) {
        this.db = db
    }

    async lookupPortfolio(transactionPortfolioId: string) {
        const entityRef = this.db.collection(COLLECTION_NAME).doc(transactionPortfolioId)
        const entityDoc = await entityRef.get()
        if (!entityDoc.exists) {
            return null
        } else {
            const entity = entityDoc.data()
            if (entity) {
                const portfolio: TPortfolioCache = {
                    portfolioId: entity.portfolioId || entity.id, // EJH NOTE: Some cache items have no assetId. use id
                }
                return portfolio
            } else {
                return null
            }
        }
    }
}
