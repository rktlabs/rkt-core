'use strict'

import { TTransaction, TTransactionPatch } from '../../models/transaction'
import { deleteCollection } from '../../util/deleters'
import { getConnectionProps } from '../getConnectionProps'
import { RepositoryBase } from '../repositoryBase'

const COLLECTION_NAME = 'transactions'

export class TransactionRepository extends RepositoryBase {
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
        entityRefCollection = this.generatePagingProperties(qs, entityRefCollection, 'transactionId')
        const entityCollectionRefs = await entityRefCollection.get()

        if (!entityCollectionRefs.empty) {
            const transactionList = entityCollectionRefs.docs
                .map((entityDoc) => {
                    const entity = entityDoc.data() as TTransaction
                    return entity
                })
                .sort((b, a) => (a.createdAt || '').localeCompare(b.createdAt || ''))
            return transactionList
        } else {
            return []
        }
    }

    async getDetailAsync(transactionId: string) {
        const entityRef = this.db.collection(COLLECTION_NAME).doc(transactionId)
        const entityDoc = await entityRef.get()

        if (!entityDoc.exists) {
            return null
        } else {
            const entity = entityDoc.data() as TTransaction
            return entity
        }
    }

    async storeAsync(entity: TTransaction) {
        const entityId = entity.transactionId
        const entityData = JSON.parse(JSON.stringify(entity))
        const entityRef = await this.db.collection(COLLECTION_NAME).doc(entityId)
        await entityRef.set(entityData)
    }

    async updateAsync(transactionId: string, entityData: TTransactionPatch) {
        const entityRef = this.db.collection(COLLECTION_NAME).doc(transactionId)
        await entityRef.update(entityData)
    }

    async scrubCollectionAsync() {
        const entityRef = this.db.collection(COLLECTION_NAME)
        await deleteCollection(entityRef)
    }
}
