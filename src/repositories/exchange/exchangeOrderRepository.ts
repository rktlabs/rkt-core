'use strict'

import { TExchangeOrder, TExchangeOrderPatch } from '../..'
import { deleteCollection } from '../../util/deleters'
import { getConnectionProps } from '../getConnectionProps'
import { RepositoryBase } from '../repositoryBase'

const COLLECTION_NAME = 'exchangeOrders'

export class ExchangeOrderRepository extends RepositoryBase {
    db: FirebaseFirestore.Firestore
    constructor() {
        super()
        this.db = getConnectionProps()
    }

    filterMap: any = {}

    async getListAsync(qs?: any) {
        let entityRefCollection: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> =
            this.db.collection(COLLECTION_NAME)

        entityRefCollection = this.generateFilterPredicate(qs, this.filterMap, entityRefCollection)
        entityRefCollection = this.generatePagingProperties(qs, entityRefCollection, 'orderId')
        const entityCollectionRefs = await entityRefCollection.get()
        const orderList = entityCollectionRefs.docs
            .map((entityDoc) => {
                const entity = entityDoc.data() as TExchangeOrder
                return entity
            })
            .sort((b, a) => (a.createdAt || '').localeCompare(b.createdAt || ''))
        return orderList
    }

    async getDetailAsync(orderId: string) {
        const entityId = `${orderId}`
        const entityRef = this.db.collection(COLLECTION_NAME).doc(entityId)
        const entityDoc = await entityRef.get()
        if (!entityDoc.exists) {
            return null
        }
        const entity = entityDoc.data() as TExchangeOrder
        return entity
    }

    async storeAsync(entity: TExchangeOrder) {
        const entityId = `${entity.portfolioId}#${entity.orderId}`
        const entityJson = JSON.parse(JSON.stringify(entity))
        await this.db.collection(COLLECTION_NAME).doc(entityId).set(entityJson)
    }

    async updateAsync(portfolioId: string, orderId: string, entity: TExchangeOrderPatch) {
        const entityId = `${portfolioId}#${orderId}`
        const entityJson = JSON.parse(JSON.stringify(entity))
        const entityRef = this.db.collection(COLLECTION_NAME).doc(entityId)
        await entityRef.update(entityJson)
    }

    async scrubCollectionAsync() {
        const entityRef = this.db.collection(COLLECTION_NAME)
        await deleteCollection(entityRef)
    }
}
