'use strict'
import { TPortfolio, TPortfolioPatch as TPortfolioUpdate } from '..'
import { deleteDocument } from '../util/deleters'
import { getConnectionProps } from './getConnectionProps'
import { RepositoryBase } from './repositoryBase'

const COLLECTION_NAME = 'portfolios'

export class PortfolioRepository extends RepositoryBase {
    db: FirebaseFirestore.Firestore
    constructor() {
        super()
        this.db = getConnectionProps()
    }

    filterMap: any = {
        type: 'type',
    }

    async getListAsync(qs?: any) {
        const filter = Object.assign({}, qs)
        const page = filter.page ? parseInt(filter.page, 10) : 1
        const pageSize = Math.min(filter.pageSize ? parseInt(filter.pageSize, 10) : 25, 1000)
        const start = (page - 1) * pageSize

        let entityRefCollection: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> =
            this.db.collection(COLLECTION_NAME)

        entityRefCollection = this.generateFilterPredicate(qs, this.filterMap, entityRefCollection)
        const entityCollectionRefs = await entityRefCollection
            .orderBy('portfolioId')
            .offset(start)
            .limit(pageSize)
            .get()
        const entityList = entityCollectionRefs.docs.map((entityDoc) => {
            const entity = entityDoc.data() as TPortfolio
            return entity
        })
        return entityList
    }

    async getDetailAsync(entityId: string) {
        const entityRef = this.db.collection(COLLECTION_NAME).doc(entityId)
        const entityDoc = await entityRef.get()
        if (!entityDoc.exists) {
            return null
        }

        const entity = (await entityDoc.data()) as TPortfolio
        return entity
    }

    async storePortfolioAsync(entity: TPortfolio) {
        const entityId = entity.portfolioId
        const entityData = JSON.parse(JSON.stringify(entity))
        const entityRef = this.db.collection(COLLECTION_NAME).doc(entityId)
        await entityRef.set(entityData)
    }

    async updatePortfolioAsync(entityId: string, entityData: TPortfolioUpdate) {
        const entityRef = this.db.collection(COLLECTION_NAME).doc(entityId)
        await entityRef.update(entityData)
    }

    async deletePortfolioAsync(entityId: string) {
        const entityRef = this.db.collection(COLLECTION_NAME).doc(entityId)
        await deleteDocument(entityRef)
    }
}
