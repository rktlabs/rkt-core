'use strict'

import * as log4js from 'log4js'
import { TAssetHolder } from '../../models/assetHolder'
import { deleteDocument } from '../../util/deleters'
import { getConnectionProps } from '../getConnectionProps'
import { RepositoryBase } from '../repositoryBase'

const logger = log4js.getLogger('AssetHolderRepository')

const COLLECTION_NAME = 'assets'
const SUB_COLLECTION_NAME = 'holders'

export class AssetHolderRepository extends RepositoryBase {
    db: FirebaseFirestore.Firestore
    constructor() {
        super()
        this.db = getConnectionProps()
    }

    async getListAsync(assetId: string, qs?: any) {
        //logger.trace(`getList ${assetId}`)
        let entityRefCollection: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = this.db
            .collection(COLLECTION_NAME)
            .doc(assetId)
            .collection(SUB_COLLECTION_NAME)

        entityRefCollection = this.generatePagingProperties(qs, entityRefCollection)
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
        //logger.trace(`getDetail ${assetId}/ ${portfolioId}`)
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
        //logger.trace(`store ${COLLECTION_NAME}/${assetId}/${SUB_COLLECTION_NAME}/${portfolioId}`, entity)
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
