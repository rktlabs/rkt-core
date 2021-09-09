'use strict'
import { TPortfolio, TPortfolioUpdate as TPortfolioUpdate } from '../..'
import { deleteDocument } from '../../util/deleters'
import { getConnectionProps } from '../getConnectionProps'
import { RepositoryBase } from '../repositoryBase'

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
        const entityRef = this.db.collection(COLLECTION_NAME).doc(entityId)
        const entityDoc = await entityRef.get()
        if (!entityDoc.exists) {
            return null
        }

        const entity = (await entityDoc.data()) as TPortfolio
        return entity
    }

    async storeAsync(entity: TPortfolio) {
        const entityId = entity.portfolioId
        const entityData = JSON.parse(JSON.stringify(entity))
        const entityRef = this.db.collection(COLLECTION_NAME).doc(entityId)
        await entityRef.set(entityData)
    }

    async updateAsync(entityId: string, entityData: TPortfolioUpdate) {
        const entityRef = this.db.collection(COLLECTION_NAME).doc(entityId)
        await entityRef.update(entityData)
    }

    async deleteAsync(entityId: string) {
        const entityRef = this.db.collection(COLLECTION_NAME).doc(entityId)
        await deleteDocument(entityRef)
    }
}
