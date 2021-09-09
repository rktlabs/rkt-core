'use strict'

import { TExchangeTrade } from '../../models/exchangeTrade'
import { deleteCollection } from '../../util/deleters'
import { getConnectionProps } from '../getConnectionProps'
import { RepositoryBase } from '../repositoryBase'
const COLLECTION_NAME = 'exchangeTrades'

export class ExchangeTradeRepository extends RepositoryBase {
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
        entityRefCollection = this.generatePagingProperties(qs, entityRefCollection, 'tradeId')
        const entityCollectionRefs = await entityRefCollection.get()
        const tradeList = entityCollectionRefs.docs
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

    async storeAsync(entity: TExchangeTrade) {
        const entityJson = JSON.parse(JSON.stringify(entity))
        const id = entity.tradeId
        await this.db.collection(COLLECTION_NAME).doc(id).set(entityJson)
        return id
    }

    async scrubCollectionAsync() {
        const entityRef = this.db.collection(COLLECTION_NAME)
        await deleteCollection(entityRef)
    }
}
