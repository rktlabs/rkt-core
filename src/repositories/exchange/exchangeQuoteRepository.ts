'use strict'
import { TExchangeQuote } from '../..'
import { deleteDocument } from '../../util/deleters'
import { getConnectionProps } from '../getConnectionProps'
import { RepositoryBase } from '../repositoryBase'

const COLLECTION_NAME = 'exchangeQuotes'

export class ExchangeQuoteRepository extends RepositoryBase {
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

        entityRefCollection = this.generatePagingProperties(qs, entityRefCollection, 'assetId')
        const entityCollectionRefs = await entityRefCollection.get()
        const entityList = entityCollectionRefs.docs.map((entityDoc) => {
            const entity = entityDoc.data() as TExchangeQuote
            return entity
        })
        return entityList
    }

    async getDetailAsync(assetId: string) {
        const entityRef = this.db.collection('exchangeQuotes').doc(assetId)
        const entityDoc = await entityRef.get()
        if (!entityDoc.exists) {
            return null
        }
        const entity = entityDoc.data() as TExchangeQuote
        return entity
    }

    async storeAsync(assetId: string, entity: TExchangeQuote) {
        const entityJson = JSON.parse(JSON.stringify(entity))
        await this.db.collection(COLLECTION_NAME).doc(assetId).set(entityJson)
    }

    async deleteAsync(assetId: string) {
        const entityRef = this.db.collection(COLLECTION_NAME).doc(assetId)
        await deleteDocument(entityRef)
    }

    // async getExchangeQuotessync(assetList: string[]) {
    //     if (Array.isArray(assetList)) {
    //         const quoteList = await Promise.all(
    //             assetList.map(async (assetId) => {
    //                 const quote = this.getDetailAsync(assetId)
    //                 return quote
    //             }),
    //         )
    //         return quoteList
    //     } else {
    //         const quote = await this.getDetailAsync(assetList)
    //         return [quote]
    //     }
    // }
}
