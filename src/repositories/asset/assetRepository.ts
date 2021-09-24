'use strict'
import * as admin from 'firebase-admin'
import * as log4js from 'log4js'
import { TAsset, TAssetCore, TAssetUpdate } from '../../models/asset'
import { deleteDocument } from '../../util/deleters'
import { CacheableRepository } from '../cacheableRepository'
import { getConnectionProps } from '../getConnectionProps'

const logger = log4js.getLogger('assetRepository')

const FieldValue = admin.firestore.FieldValue

const COLLECTION_NAME = 'assets'

export class AssetRepository extends CacheableRepository {
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
        logger.trace(`getList ${qs}`)
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

    async getDetailAsync(entityId: string) {
        const cachedItem = this.cacheLookup(entityId)
        if (cachedItem) {
            return cachedItem
        }

        logger.trace(`getDetail ${entityId}`)
        const entityRef = this.db.collection(COLLECTION_NAME).doc(entityId)
        const entityDoc = await entityRef.get()

        if (!entityDoc.exists) {
            return null
        } else {
            const entity = entityDoc.data() as TAsset
            this.cacheEntity(entityId, entity)
            return entity
        }
    }

    async storeAsync(entity: TAsset) {
        logger.trace(`store ${entity.assetId}`)
        this.cacheClear(entity.assetId)
        const entityId = entity.assetId
        const entityData = JSON.parse(JSON.stringify(entity))
        const entityRef = this.db.collection(COLLECTION_NAME).doc(entityId)
        await entityRef.set(entityData)
    }

    async updateAsync(entityId: string, entityData: TAssetUpdate) {
        logger.trace(`update ${entityId}`)
        this.cacheClear(entityId)
        const entityRef = this.db.collection(COLLECTION_NAME).doc(entityId)
        await entityRef.update(entityData)
    }

    async addMinted(entityId: string, units: number) {
        logger.trace(`addMinted ${entityId}`)
        const entityRef = this.db.collection(COLLECTION_NAME).doc(entityId)
        await entityRef.update({ issuedUnits: FieldValue.increment(units) })
    }

    async addBurned(entityId: string, units: number) {
        logger.trace(`addBurned ${entityId}`)
        const entityRef = this.db.collection(COLLECTION_NAME).doc(entityId)
        await entityRef.update({ burnedUnits: FieldValue.increment(units) })
    }

    async deleteAsync(entityId: string) {
        logger.trace(`delete ${entityId}`)
        this.cacheClear(entityId)
        const entityRef = this.db.collection(COLLECTION_NAME).doc(entityId)
        await deleteDocument(entityRef)
    }

    async getLeagueAssetsAsync(leagueId: string): Promise<TAssetCore[]> {
        logger.trace(`getLeagueAssets ${leagueId}`)
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
