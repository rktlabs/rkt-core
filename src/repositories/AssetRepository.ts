'use strict'
import { TAsset, TAssetCache, TAssetUpdate } from '..'
import { deleteDocument } from '../util/deleters'
import { IRepository } from './IRepository'

import * as admin from 'firebase-admin'
const FieldValue = admin.firestore.FieldValue

const COLLECTION_NAME = 'assets'
const CACHE_NAME = 'assetCache'

export class AssetRepository implements IRepository {
    db: FirebaseFirestore.Firestore
    constructor(db: FirebaseFirestore.Firestore) {
        this.db = db
    }

    async listAssets(qs?: any) {
        const filter = Object.assign({}, qs)
        const page = filter.page ? parseInt(filter.page, 10) : 1
        const pageSize = Math.min(filter.pageSize ? parseInt(filter.pageSize, 10) : 25, 1000)
        const start = (page - 1) * pageSize
        delete filter.page // ignore "page" querystring parm
        delete filter.pageSize // ignore "page" querystring parm

        let entityRefCollection: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> =
            this.db.collection(COLLECTION_NAME)
        if (filter) {
            for (const filterParm in filter) {
                if (Array.isArray(filter[filterParm])) {
                    const filterValues = filter[filterParm]
                    entityRefCollection = entityRefCollection.where(filterParm, 'in', filterValues)
                } else {
                    const filterValue = filter[filterParm]
                    entityRefCollection = entityRefCollection.where(filterParm, '==', filterValue)
                }
            }
        }
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

        // store cached asset
        const cacheRecord: TAssetCache = {
            assetId: entity.assetId,
            symbol: entity.symbol,
            type: entity.type,
            contractId: entity.contractId,
            cumulativeEarnings: entity.cumulativeEarnings,
        }
        if (entity.portfolioId) {
            cacheRecord.portfolioId = entity.portfolioId
        }
        const cacheRef = this.db.collection(CACHE_NAME).doc(entityId)
        await cacheRef.set(cacheRecord)
    }

    async updateAsset(assetId: string, entityData: TAssetUpdate) {
        const entityRef = this.db.collection(COLLECTION_NAME).doc(assetId)
        await entityRef.update(entityData)
    }

    async deleteAsset(assetId: string) {
        const entityRef = this.db.collection(COLLECTION_NAME).doc(assetId)
        await deleteDocument(entityRef)

        // delete cache
        const cacheRef = this.db.collection(CACHE_NAME).doc(assetId)
        await deleteDocument(cacheRef)
    }

    async adjustCumulativeEarnings(assetId: string, cumulativeEarningsDelta: number) {
        const entityRef = this.db.collection(COLLECTION_NAME).doc(assetId)
        const data = {
            cumulativeEarnings: FieldValue.increment(cumulativeEarningsDelta),
        }
        await entityRef.update(data)

        // adjust cache
        const cacheRef = this.db.collection(CACHE_NAME).doc(assetId)
        await cacheRef.update(data)
    }

    async listContractAssets(contractId: string) {
        let entityRefCollection = this.db.collection(COLLECTION_NAME).where('contractId', '==', contractId)
        const entityCollectionRefs = await entityRefCollection.get()
        if (!entityCollectionRefs.empty) {
            const assetIdList = entityCollectionRefs.docs.map((entityDoc) => {
                return entityDoc.id
            })
            return assetIdList
        } else {
            return []
        }
    }

    async listEarnerAssets(earnerId: string) {
        let entityRefCollection = this.db.collection(COLLECTION_NAME).where('earnerId', '==', earnerId)
        const entityCollectionRefs = await entityRefCollection.get()
        if (!entityCollectionRefs.empty) {
            const assetIdList = entityCollectionRefs.docs.map((entityDoc) => {
                return entityDoc.id
            })
            return assetIdList
        } else {
            return []
        }
    }
}
