'use strict'
import { IRepository } from './IRepository'

import { deleteDocument } from '../util/deleters'
import { TAssetHolder } from '..'

const COLLECTION_NAME = 'assets'
const SUB_COLLECTION_NAME = 'holders'

export class AssetHolderRepository implements IRepository {
    db: FirebaseFirestore.Firestore
    constructor(db: FirebaseFirestore.Firestore) {
        this.db = db
    }

    async storeAssetHolder(assetId: string, portfolioId: string, entity: TAssetHolder) {
        const entityData = JSON.parse(JSON.stringify(entity))
        const entityRef = this.db
            .collection(COLLECTION_NAME)
            .doc(assetId)
            .collection(SUB_COLLECTION_NAME)
            .doc(portfolioId)
        await entityRef.set(entityData)
    }

    async listAssetHolders(assetId: string) {
        let entityRefCollection = this.db.collection(COLLECTION_NAME).doc(assetId).collection(SUB_COLLECTION_NAME)
        const entityCollectionRefs = await entityRefCollection.get()
        if (!entityCollectionRefs.empty) {
            const itemList = entityCollectionRefs.docs.map((entityDoc) => {
                const entity = entityDoc.data() as TAssetHolder
                return entity
            })
            return itemList
        } else {
            return []
        }
    }

    async getAssetHolder(assetId: string, portfolioId: string) {
        const entityRef = this.db
            .collection(COLLECTION_NAME)
            .doc(assetId)
            .collection(SUB_COLLECTION_NAME)
            .doc(portfolioId)
        const entityDoc = await entityRef.get()
        if (!entityDoc.exists) {
            return null
        }
        const entity = entityDoc.data() as TAssetHolder
        return entity
    }

    async deleteAssetHolder(assetId: string, portfolioId: string) {
        const entityRef = this.db
            .collection(COLLECTION_NAME)
            .doc(assetId)
            .collection(SUB_COLLECTION_NAME)
            .doc(portfolioId)
        await deleteDocument(entityRef)
    }
}
