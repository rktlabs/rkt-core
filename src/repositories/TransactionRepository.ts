'use strict'

import { TTransaction, TTransactionPatch } from '../models/transaction'
import { deleteCollection } from '../util/deleters'
import { IRepository } from './IRepository'

const COLLECTION_NAME = 'transactions'

export class TransactionRepository implements IRepository {
    db: FirebaseFirestore.Firestore
    constructor(db: FirebaseFirestore.Firestore) {
        this.db = db
    }

    async listTransactions(qs?: any) {
        const filter = Object.assign({}, qs)
        const page = filter.page ? parseInt(filter.page, 10) : 1
        const pageSize = Math.min(filter.pageSize ? parseInt(filter.pageSize, 10) : 25, 1000)
        const start = (page - 1) * pageSize
        delete filter.page // ignore "page" querystring parm
        delete filter.pageSize // ignore "page" querystring parm

        let entityRefCollection: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> =
            this.db.collection(COLLECTION_NAME)
        if (filter) {
            for (const filterParm in filter) {
                if (Array.isArray(filter[filterParm])) {
                    const filterValues = filter[filterParm]
                    entityRefCollection = entityRefCollection.where(filterParm, 'in', filterValues)
                } else {
                    const filterValue = filter[filterParm]
                    entityRefCollection = entityRefCollection.where(filterParm, '==', filterValue)
                }
            }
        }
        const entityCollectionRefs = await entityRefCollection
            .orderBy('transactionId')
            .offset(start)
            .limit(pageSize)
            .get()
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

    async getTransaction(transactionId: string) {
        const entityRef = this.db.collection(COLLECTION_NAME).doc(transactionId)
        const entityDoc = await entityRef.get()

        if (!entityDoc.exists) {
            return null
        } else {
            const entity = entityDoc.data() as TTransaction
            return entity
        }
    }

    async storeTransaction(entity: TTransaction) {
        const entityId = entity.transactionId
        const entityData = JSON.parse(JSON.stringify(entity))
        const entityRef = await this.db.collection(COLLECTION_NAME).doc(entityId)
        await entityRef.set(entityData)
    }

    async updateTransaction(transactionId: string, entityData: TTransactionPatch) {
        const entityRef = this.db.collection(COLLECTION_NAME).doc(transactionId)
        await entityRef.update(entityData)
    }

    async scrubTransactionCollection() {
        const entityRef = this.db.collection(COLLECTION_NAME)
        await deleteCollection(entityRef)
    }
}
