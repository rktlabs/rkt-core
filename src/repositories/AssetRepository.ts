'use strict'
import { deleteDocument } from '../util/deleters'

import { getConnectionProps } from './getConnectionProps'
import { RepositoryBase } from './repositoryBase'
import { TAsset, TAssetUpdate } from '..'

const COLLECTION_NAME = 'assets'

export class AssetRepository extends RepositoryBase {
    db: FirebaseFirestore.Firestore
    constructor() {
        super()
        this.db = getConnectionProps()
    }

    filterMap: any = {
        type: 'type',
    }

    async listAssets(qs?: any) {
        const filter = Object.assign({}, qs)
        const page = filter.page ? parseInt(filter.page, 10) : 1
        const pageSize = Math.min(filter.pageSize ? parseInt(filter.pageSize, 10) : 25, 1000)
        const start = (page - 1) * pageSize

        let entityRefCollection: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> =
            this.db.collection(COLLECTION_NAME)

        entityRefCollection = this.generateFilterPredicate(qs, this.filterMap, entityRefCollection)

        const entityCollectionRefs = await entityRefCollection.orderBy('assetId').offset(start).limit(pageSize).get()
        if (!entityCollectionRefs.empty) {
            const assetList = entityCollectionRefs.docs.map((entityDoc) => {
                const entity = entityDoc.data() as TAsset
                return entity
            })
            return assetList
        } else {
            return []
        }
    }

    async getAsset(assetId: string) {
        const entityRef = this.db.collection(COLLECTION_NAME).doc(assetId)
        const entityDoc = await entityRef.get()

        if (!entityDoc.exists) {
            return null
        } else {
            const entity = entityDoc.data() as TAsset
            return entity
        }
    }

    async storeAsset(entity: TAsset) {
        const entityId = entity.assetId
        const entityData = JSON.parse(JSON.stringify(entity))
        const entityRef = this.db.collection(COLLECTION_NAME).doc(entityId)
        await entityRef.set(entityData)
    }

    async updateAsset(assetId: string, entityData: TAssetUpdate) {
        const entityRef = this.db.collection(COLLECTION_NAME).doc(assetId)
        await entityRef.update(entityData)
    }

    async deleteAsset(assetId: string) {
        const entityRef = this.db.collection(COLLECTION_NAME).doc(assetId)
        await deleteDocument(entityRef)
    }

    // async listLeagueAssets(leagueId: string) {
    //     let entityRefCollection = this.db.collection(COLLECTION_NAME).where('leagueId', '==', leagueId)
    //     const entityCollectionRefs = await entityRefCollection.get()
    //     if (!entityCollectionRefs.empty) {
    //         const assetIdList = entityCollectionRefs.docs.map((entityDoc) => {
    //             return entityDoc.id
    //         })
    //         return assetIdList
    //     } else {
    //         return []
    //     }
    // }
}
