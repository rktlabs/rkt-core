'use strict'

import { deleteDocument } from '../util/deleters'
import { TAssetHolder } from '../models/assetHolder'
import { getConnectionProps } from './getConnectionProps'
import { RepositoryBase } from './repositoryBase'

const COLLECTION_NAME = 'assets'
const SUB_COLLECTION_NAME = 'holders'

export class AssetHolderRepository extends RepositoryBase {
    db: FirebaseFirestore.Firestore
    constructor() {
        super()
        this.db = getConnectionProps()
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

    // TODO: updateAssetHolder??? - need to update units for asset holder quantity

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
