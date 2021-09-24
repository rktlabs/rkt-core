'use strict'

import { deleteDocument } from '../../util/deleters'
import { TAssetHolder } from '../../models/assetHolder'
import { getConnectionProps } from '../getConnectionProps'
import { RepositoryBase } from '../repositoryBase'

import * as log4js from 'log4js'
const logger = log4js.getLogger('assetHolderRepository')

const COLLECTION_NAME = 'assets'
const SUB_COLLECTION_NAME = 'holders'

export class AssetHolderRepository extends RepositoryBase {
    db: FirebaseFirestore.Firestore
    constructor() {
        super()
        this.db = getConnectionProps()
    }

    // TODO: updateAssetHolder??? - need to update units for asset holder quantity

    async getListAsync(assetId: string) {
        logger.trace(`getList ${assetId}`)
        const entityRefCollection = this.db.collection(COLLECTION_NAME).doc(assetId).collection(SUB_COLLECTION_NAME)

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

    async getDetailAsync(assetId: string, portfolioId: string) {
        logger.trace(`getDetail ${assetId}/ ${portfolioId}`)
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

    async storeAsync(assetId: string, portfolioId: string, entity: TAssetHolder) {
        logger.trace(`store ${assetId}/ ${portfolioId}`)
        const entityData = JSON.parse(JSON.stringify(entity))
        const entityRef = this.db
            .collection(COLLECTION_NAME)
            .doc(assetId)
            .collection(SUB_COLLECTION_NAME)
            .doc(portfolioId)
        await entityRef.set(entityData)
    }

    async deleteAsync(assetId: string, portfolioId: string) {
        logger.trace(`delete ${assetId}/ ${portfolioId}`)
        const entityRef = this.db
            .collection(COLLECTION_NAME)
            .doc(assetId)
            .collection(SUB_COLLECTION_NAME)
            .doc(portfolioId)
        await deleteDocument(entityRef)
    }
}
