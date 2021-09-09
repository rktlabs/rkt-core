'use strict'

import { TExchangeOrder, TExchangeOrderPatch } from '..'
import { deleteCollection } from '../util/deleters'
import { getConnectionProps } from './getConnectionProps'
import { RepositoryBase } from './repositoryBase'

const COLLECTION_NAME = 'exchangeOrders'

export class ExchangeOrderRepository extends RepositoryBase {
    db: FirebaseFirestore.Firestore
    constructor() {
        super()
        this.db = getConnectionProps()
    }

    async getListAsync(qs?: any) {
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

        const entityRefCollection = await entityCollectionRef
            .orderBy('exchangeOrderId')
            .offset(start)
            .limit(pageSize)
            .get()
        const orderList = entityRefCollection.docs
            .map((entityDoc) => {
                const entity = entityDoc.data() as TExchangeOrder
                return entity
            })
            .sort((b, a) => (a.createdAt || '').localeCompare(b.createdAt || ''))
        return orderList
    }

    async getDetailAsync(portfolioId: string, orderId: string) {
        const entityId = `${portfolioId}#${orderId}`
        const entityRef = this.db.collection(COLLECTION_NAME).doc(entityId)
        const entityDoc = await entityRef.get()
        if (!entityDoc.exists) {
            return null
        }
        const entity = entityDoc.data() as TExchangeOrder
        return entity
    }

    async storeExchangeOrder(entity: TExchangeOrder) {
        const entityId = `${entity.portfolioId}#${entity.orderId}`
        const entityJson = JSON.parse(JSON.stringify(entity))
        await this.db.collection(COLLECTION_NAME).doc(entityId).set(entityJson)
    }

    async updateExchangeOrder(portfolioId: string, orderId: string, entity: TExchangeOrderPatch) {
        const entityId = `${portfolioId}#${orderId}`
        const entityJson = JSON.parse(JSON.stringify(entity))
        const entityRef = this.db.collection(COLLECTION_NAME).doc(entityId)
        await entityRef.update(entityJson)
    }

    async scrubExecutionOrderCollection() {
        const entityRef = this.db.collection(COLLECTION_NAME)
        await deleteCollection(entityRef)
    }
}
