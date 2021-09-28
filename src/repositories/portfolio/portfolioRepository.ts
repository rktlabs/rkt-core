'use strict'
import * as log4js from 'log4js'
import { TPortfolio, TPortfolioUpdate as TPortfolioUpdate } from '../..'
import { deleteDocument } from '../../util/deleters'
import { CacheableRepository } from '../cacheableRepository'
import { getConnectionProps } from '../getConnectionProps'

const logger = log4js.getLogger('PortfolioRepository')

const COLLECTION_NAME = 'portfolios'

export class PortfolioRepository extends CacheableRepository {
    db: FirebaseFirestore.Firestore
    constructor() {
        super()
        this.db = getConnectionProps()
    }

    filterMap: any = {
        type: 'type',
    }

    async getListAsync(qs?: any) {
        //logger.trace(`getList ${qs}`)
        let entityRefCollection: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> =
            this.db.collection(COLLECTION_NAME)

        entityRefCollection = this.generateFilterPredicate(qs, this.filterMap, entityRefCollection)
        entityRefCollection = this.generatePagingProperties(qs, entityRefCollection, 'portfolioId')
        const entityCollectionRefs = await entityRefCollection.get()

        const entityList = entityCollectionRefs.docs.map((entityDoc) => {
            const entity = entityDoc.data() as TPortfolio
            return entity
        })
        return entityList
    }

    async getDetailAsync(entityId: string) {
        const cachedItem = this.cacheLookup(entityId)
        if (cachedItem) {
            return cachedItem
        }

        //logger.trace(`getDetail ${entityId}`)
        const entityRef = this.db.collection(COLLECTION_NAME).doc(entityId)
        const entityDoc = await entityRef.get()
        if (!entityDoc.exists) {
            return null
        }

        const entity = (await entityDoc.data()) as TPortfolio
        this.cacheEntity(entityId, entity)
        return entity
    }

    async storeAsync(entity: TPortfolio) {
        logger.trace(`store ${entity.portfolioId}`)
        this.cacheClear(entity.portfolioId)
        const entityId = entity.portfolioId
        const entityData = JSON.parse(JSON.stringify(entity))
        const entityRef = this.db.collection(COLLECTION_NAME).doc(entityId)
        await entityRef.set(entityData)
    }

    async updateAsync(entityId: string, entityData: TPortfolioUpdate) {
        logger.trace(`update ${entityId}`)
        this.cacheClear(entityId)
        const entityRef = this.db.collection(COLLECTION_NAME).doc(entityId)
        await entityRef.update(entityData)
    }

    async deleteAsync(entityId: string) {
        logger.trace(`delete ${entityId}`)
        this.cacheClear(entityId)
        const entityRef = this.db.collection(COLLECTION_NAME).doc(entityId)
        await deleteDocument(entityRef)
    }
}
