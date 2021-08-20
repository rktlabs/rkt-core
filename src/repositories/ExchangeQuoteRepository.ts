'use strict'
import { TExchangeQuote } from '..'
import { deleteDocument } from '../util/deleters'
import { IRepository } from './IRepository'

const COLLECTION_NAME = 'exchangeQuotes'

export class ExchangeQuoteRepository implements IRepository {
    db: FirebaseFirestore.Firestore
    constructor(db: FirebaseFirestore.Firestore) {
        this.db = db
    }

    async storeExchangeQuote(assetId: string, entity: TExchangeQuote) {
        const entityJson = JSON.parse(JSON.stringify(entity))
        await this.db.collection(COLLECTION_NAME).doc(assetId).set(entityJson)
    }

    async listExchangeQuotes(qs?: any) {
        const filter = Object.assign({}, qs)
        const page = filter.page ? parseInt(filter.page, 10) : 1
        const pageSize = Math.min(filter.pageSize ? parseInt(filter.pageSize, 10) : 25, 1000)
        const start = (page - 1) * pageSize
        delete filter.page // ignore "page" querystring parm
        delete filter.pageSize // ignore "page" querystring parm

        let entityCollectionRef: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> =
            this.db.collection(COLLECTION_NAME)

        for (const filterParm in filter) {
            if (Array.isArray(filter[filterParm])) {
                const filterValues = filter[filterParm]
                entityCollectionRef = entityCollectionRef.where(filterParm, 'in', filterValues)
            } else {
                const filterValue = filter[filterParm]
                entityCollectionRef = entityCollectionRef.where(filterParm, '==', filterValue)
            }
        }

        const entityRefCollection = await entityCollectionRef
            .orderBy('exchangeQuoteId')
            .offset(start)
            .limit(pageSize)
            .get()
        const entityList = entityRefCollection.docs.map((entityDoc) => {
            const entity = entityDoc.data() as TExchangeQuote
            return entity
        })
        return entityList
    }

    async getExchangeQuote(assetId: string) {
        const entityRef = this.db.collection('exchangeQuotes').doc(assetId)
        const entityDoc = await entityRef.get()
        if (!entityDoc.exists) {
            return null
        }
        const entity = entityDoc.data() as TExchangeQuote
        return entity
    }

    async getExchangeQuotes(assetList: string[]) {
        if (Array.isArray(assetList)) {
            const quoteList = await Promise.all(
                assetList.map(async (assetId) => {
                    const quote = this.getExchangeQuote(assetId)
                    return quote
                }),
            )
            return quoteList
        } else {
            const quote = await this.getExchangeQuote(assetList)
            return [quote]
        }
    }

    async deleteExchangeQuote(assetId: string) {
        const entityRef = this.db.collection(COLLECTION_NAME).doc(assetId)
        await deleteDocument(entityRef)
    }
}
