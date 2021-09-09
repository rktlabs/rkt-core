'use strict'

import { TExchangeTrade } from '../models/exchangeTrade'
import { deleteCollection } from '../util/deleters'
import { getConnectionProps } from './getConnectionProps'
import { RepositoryBase } from './repositoryBase'
const COLLECTION_NAME = 'exchangeTrades'

export class ExchangeTradeRepository extends RepositoryBase {
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

        // const entityRefCollection = await entityCollectionRef.orderBy('createdAt', 'desc').get();
        const entityRefCollection = await entityCollectionRef.orderBy('tradeId').offset(start).limit(pageSize).get()
        const tradeList = entityRefCollection.docs
            .map((entityDoc) => {
                const entity = entityDoc.data() as TExchangeTrade
                return entity
            })
            .sort((b, a) => (a.createdAt || a.executedAt || '').localeCompare(b.createdAt || b.executedAt || ''))
        return tradeList
    }

    async getDetailAsync(tradeId: string) {
        const entityId = `${tradeId}`
        const entityRef = this.db.collection(COLLECTION_NAME).doc(entityId)
        const entityDoc = await entityRef.get()
        if (!entityDoc.exists) {
            return null
        }
        const entity = entityDoc.data() as TExchangeTrade
        return entity
    }

    async storeExchangeTrade(entity: TExchangeTrade) {
        const entityJson = JSON.parse(JSON.stringify(entity))
        const id = entity.tradeId
        await this.db.collection(COLLECTION_NAME).doc(id).set(entityJson)
        return id
    }

    async scrubExchangeTradeCollection() {
        const entityRef = this.db.collection(COLLECTION_NAME)
        await deleteCollection(entityRef)
    }
}
