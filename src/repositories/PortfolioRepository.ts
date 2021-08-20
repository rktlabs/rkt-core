'use strict'
import { TPortfolio, TPortfolioCache, TPortfolioPatch } from '..'
import { deleteDocument } from '../util/deleters'
import { IRepository } from './IRepository'

const COLLECTION_NAME = 'portfolios'
const CACHE_NAME = 'portfolioCache'

export class PortfolioRepository implements IRepository {
    db: FirebaseFirestore.Firestore
    constructor(db: FirebaseFirestore.Firestore) {
        this.db = db
    }

    async listPortfolios(qs?: any) {
        const filter = Object.assign({}, qs)
        const page = filter.page ? parseInt(filter.page, 10) : 1
        const pageSize = Math.min(filter.pageSize ? parseInt(filter.pageSize, 10) : 25, 1000)
        const start = (page - 1) * pageSize
        delete filter.page // ignore "page" querystring parm
        delete filter.pageSize // ignore "page" querystring parm

        let entityCollectionRef: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> =
            this.db.collection(COLLECTION_NAME)
        if (filter) {
            for (const filterParm in filter) {
                if (Array.isArray(filter[filterParm])) {
                    const filterValues = filter[filterParm]
                    entityCollectionRef = entityCollectionRef.where(filterParm, 'in', filterValues)
                } else {
                    const filterValue = filter[filterParm]
                    entityCollectionRef = entityCollectionRef.where(filterParm, '==', filterValue)
                }
            }
        }

        const entityRefCollection = await entityCollectionRef.orderBy('portfolioId').offset(start).limit(pageSize).get()
        const entityList = entityRefCollection.docs.map((entityDoc) => {
            const entity = entityDoc.data() as TPortfolio
            return entity
        })
        return entityList
    }

    async getPortfolio(entityId: string) {
        const entityRef = this.db.collection(COLLECTION_NAME).doc(entityId)
        const entityDoc = await entityRef.get()
        if (!entityDoc.exists) {
            return null
        }

        const entity = (await entityDoc.data()) as TPortfolio
        return entity
    }

    async storePortfolio(entity: TPortfolio) {
        const entityId = entity.portfolioId
        const entityData = JSON.parse(JSON.stringify(entity))
        const entityRef = this.db.collection(COLLECTION_NAME).doc(entityId)
        await entityRef.set(entityData)

        // cache portfolio
        const cacheRecord: TPortfolioCache = {
            portfolioId: entity.portfolioId,
        }
        const cacheRef = this.db.collection(CACHE_NAME).doc(entityId)
        await cacheRef.set(cacheRecord)
    }

    async updatePortfolio(entityId: string, entityData: TPortfolioPatch) {
        const entityRef = this.db.collection(COLLECTION_NAME).doc(entityId)
        await entityRef.update(entityData)
    }

    async deletePortfolio(entityId: string) {
        const entityRef = this.db.collection(COLLECTION_NAME).doc(entityId)
        await deleteDocument(entityRef)

        // delete cache
        const cacheRef = this.db.collection(CACHE_NAME).doc(entityId)
        await deleteDocument(cacheRef)
    }
}
