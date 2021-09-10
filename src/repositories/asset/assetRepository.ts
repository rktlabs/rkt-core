'use strict'
import { deleteDocument } from '../../util/deleters'

import { getConnectionProps } from '../getConnectionProps'
import { RepositoryBase } from '../repositoryBase'
import { TAsset, TAssetUpdate } from '../../models/asset'

const COLLECTION_NAME = 'assets'

export class AssetRepository extends RepositoryBase {
    db: FirebaseFirestore.Firestore
    constructor() {
        super()
        this.db = getConnectionProps()
    }

    filterMap: any = {
        leagueId: 'leagueId',
        contractId: 'contractId',
        type: 'type',
    }

    async getListAsync(qs?: any) {
        let entityRefCollection: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> =
            this.db.collection(COLLECTION_NAME)

        entityRefCollection = this.generateFilterPredicate(qs, this.filterMap, entityRefCollection)
        entityRefCollection = this.generatePagingProperties(qs, entityRefCollection, 'assetId')
        const entityCollectionRefs = await entityRefCollection.get()

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

    async getDetailAsync(assetId: string) {
        const entityRef = this.db.collection(COLLECTION_NAME).doc(assetId)
        const entityDoc = await entityRef.get()

        if (!entityDoc.exists) {
            return null
        } else {
            const entity = entityDoc.data() as TAsset
            return entity
        }
    }

    async storeAsync(entity: TAsset) {
        const entityId = entity.assetId
        const entityData = JSON.parse(JSON.stringify(entity))
        const entityRef = this.db.collection(COLLECTION_NAME).doc(entityId)
        await entityRef.set(entityData)
    }

    async updateAsync(assetId: string, entityData: TAssetUpdate) {
        const entityRef = this.db.collection(COLLECTION_NAME).doc(assetId)
        await entityRef.update(entityData)
    }

    async deleteAsync(assetId: string) {
        const entityRef = this.db.collection(COLLECTION_NAME).doc(assetId)
        await deleteDocument(entityRef)
    }

    async getLeagueAssetsAsync(leagueId: string) {
        // TODO: renaem contractId to leagueId
        //let entityRefCollection = this.db.collection(COLLECTION_NAME).where('leagueId', '==', leagueId)
        const entityRefCollection = this.db.collection(COLLECTION_NAME).where('contractId', '==', leagueId)
        const entityCollectionRefs = await entityRefCollection.get()
        if (!entityCollectionRefs.empty) {
            const assetList = entityCollectionRefs.docs.map((entityDoc) => {
                const entity = entityDoc.data() as TAsset
                return { id: entity.assetId, displayName: entity.displayName }
            })
            return assetList
        } else {
            return []
        }
    }
}