'use strict'
import { deleteDocument } from '../../util/deleters'

import { getConnectionProps } from '../getConnectionProps'
import { RepositoryBase } from '../repositoryBase'
import { TAsset, TAssetCore, TAssetUpdate } from '../../models/asset'
import * as admin from 'firebase-admin'
const FieldValue = admin.firestore.FieldValue

const COLLECTION_NAME = 'assets'

export class AssetRepository extends RepositoryBase {
    db: FirebaseFirestore.Firestore
    constructor() {
        super()
        this.db = getConnectionProps()
    }

    filterMap: any = {
        leagueId: 'leagueId',
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

    async addMinted(assetId: string, units: number) {
        const entityRef = this.db.collection(COLLECTION_NAME).doc(assetId)
        await entityRef.update({ issuedUnits: FieldValue.increment(units) })
    }

    async addBurned(assetId: string, units: number) {
        const entityRef = this.db.collection(COLLECTION_NAME).doc(assetId)
        await entityRef.update({ burnedUnits: FieldValue.increment(units) })
    }

    async deleteAsync(assetId: string) {
        const entityRef = this.db.collection(COLLECTION_NAME).doc(assetId)
        await deleteDocument(entityRef)
    }

    async getLeagueAssetsAsync(leagueId: string): Promise<TAssetCore[]> {
        // TODO: renaem leagueId to leagueId
        const entityRefCollection = this.db.collection(COLLECTION_NAME).where('leagueId', '==', leagueId)
        const entityCollectionRefs = await entityRefCollection.get()
        if (!entityCollectionRefs.empty) {
            const assetList = entityCollectionRefs.docs.map((entityDoc) => {
                const entity = entityDoc.data() as TAsset
                return { assetId: entity.assetId, displayName: entity.displayName }
            })
            return assetList
        } else {
            return []
        }
    }

    async isPortfolioUsed(portfolioId: string) {
        // check for linked assets
        const entityRefCollection = this.db.collection('assets').where('portfolioId', '==', portfolioId)
        const entityCollectionRefs = await entityRefCollection.get()
        if (entityCollectionRefs.size > 0) {
            const ids = entityCollectionRefs.docs.map((doc) => {
                const data = doc.data()
                return data.assetId
            })

            const idList = ids.join(', ')
            return idList
        } else {
            return null
        }
    }

    async isLeagueUsed(leagueId: string) {
        // check for linked assets
        const entityRefCollection = this.db.collection('assets').where('leagueId', '==', leagueId)
        const entityCollectionRefs = await entityRefCollection.get()
        if (entityCollectionRefs.size > 0) {
            const ids = entityCollectionRefs.docs.map((doc) => {
                const data = doc.data()
                return data.assetId
            })

            const idList = ids.join(', ')
            return idList
        } else {
            return null
        }
    }
}
