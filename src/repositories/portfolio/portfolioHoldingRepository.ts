'use strict'
import * as log4js from 'log4js'
import { TPortfolioHolding } from '../..'
import { deleteDocument } from '../../util/deleters'
import { getConnectionProps } from '../getConnectionProps'
import { RepositoryBase } from '../repositoryBase'

const logger = log4js.getLogger('portfolioHoldingRepository')

const COLLECTION_NAME = 'portfolios'
const SUB_COLLECTION_NAME = 'holdings'

export class PortfolioHoldingRepository extends RepositoryBase {
    db: FirebaseFirestore.Firestore
    constructor() {
        super()
        this.db = getConnectionProps()
    }

    async getListAsync(portfolioId: string, qs?: any) {
        //logger.trace(`getList ${portfolioId}`)
        let entityRefCollection: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = this.db
            .collection(COLLECTION_NAME)
            .doc(portfolioId)
            .collection(SUB_COLLECTION_NAME)

        entityRefCollection = this.generatePagingProperties(qs, entityRefCollection)
        const entityCollectionRefs = await entityRefCollection.get()

        const entityList = entityCollectionRefs.docs.map((entityDoc) => {
            const entity = entityDoc.data() as TPortfolioHolding
            return entity
        })

        return entityList
    }

    async getDetailAsync(portfolioId: string, assetId: string) {
        //logger.trace(`getDetail ${portfolioId}/${assetId}`)
        const entityRef = this.db
            .collection(COLLECTION_NAME)
            .doc(portfolioId)
            .collection(SUB_COLLECTION_NAME)
            .doc(assetId)
        const entityDoc = await entityRef.get()
        if (!entityDoc.exists) {
            return null
        }

        const entity = entityDoc.data() as TPortfolioHolding
        return entity
    }

    async storeAsync(portfolioId: string, assetId: string, entity: TPortfolioHolding) {
        logger.trace(`store ${COLLECTION_NAME}/${portfolioId}/${SUB_COLLECTION_NAME}/${assetId}`, entity)
        const entityData = JSON.parse(JSON.stringify(entity))
        const entityRef = this.db
            .collection(COLLECTION_NAME)
            .doc(portfolioId)
            .collection(SUB_COLLECTION_NAME)
            .doc(assetId)
        await entityRef.set(entityData)
    }

    async deleteAsync(portfolioId: string, assetId: string) {
        logger.trace(`delete ${portfolioId}/${assetId}`)
        const entityRef = this.db
            .collection(COLLECTION_NAME)
            .doc(portfolioId)
            .collection(SUB_COLLECTION_NAME)
            .doc(assetId)

        await deleteDocument(entityRef)
    }
}
