'use strict'
import { TOrder, TOrderPatch } from '../../models/portfolioOrder'
import { getConnectionProps } from '../getConnectionProps'
import { RepositoryBase } from '../repositoryBase'

const COLLECTION_NAME = 'portfolios'
const SUB_COLLECTION_NAME = 'orders'

export class PortfolioOrdersRepository extends RepositoryBase {
    db: FirebaseFirestore.Firestore
    constructor() {
        super()
        this.db = getConnectionProps()
    }

    filterMap: any = {}

    async getListAsync(portfolioId: string, qs?: any) {
        let entityRefCollection: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = this.db
            .collection(COLLECTION_NAME)
            .doc(portfolioId)
            .collection(SUB_COLLECTION_NAME)

        entityRefCollection = this.generateFilterPredicate(qs, this.filterMap, entityRefCollection)
        entityRefCollection = this.generatePagingProperties(qs, entityRefCollection)
        const entityCollectionRefs = await entityRefCollection.get()

        const entityList = entityCollectionRefs.docs.map((entityDoc) => {
            const entity = entityDoc.data() as TOrder
            return entity
        })
        return entityList
    }

    async getDetailAsync(portfolioId: string, orderId: string) {
        const entityRef = this.db
            .collection(COLLECTION_NAME)
            .doc(portfolioId)
            .collection(SUB_COLLECTION_NAME)
            .doc(orderId)
        const entityDoc = await entityRef.get()
        if (!entityDoc.exists) {
            return null
        }
        const entity = entityDoc.data() as TOrder
        return entity
    }

    async storeAsync(portfolioId: string, entity: TOrder) {
        const entityJson = JSON.parse(JSON.stringify(entity))
        const entityRef = await this.db
            .collection(COLLECTION_NAME)
            .doc(portfolioId)
            .collection(SUB_COLLECTION_NAME)
            .doc(entity.orderId)

        await entityRef.set(entityJson)
    }

    async updateAsync(portfolioId: string, orderId: string, entityJson: TOrderPatch) {
        const entityRef = this.db
            .collection(COLLECTION_NAME)
            .doc(portfolioId)
            .collection(SUB_COLLECTION_NAME)
            .doc(orderId)
        await entityRef.update(entityJson)
    }

    async atomicUpdateAsync(portfolioId: string, orderId: string, func: (order: TOrder) => TOrder | undefined) {
        // needs to perform 1 or 2 updates and perform them in a transaction
        try {
            const entityRef = this.db
                .collection(COLLECTION_NAME)
                .doc(portfolioId)
                .collection(SUB_COLLECTION_NAME)
                .doc(orderId)
            await this.db.runTransaction(async (t) => {
                const entityDoc = await t.get(entityRef)
                const entity = entityDoc.data() as TOrder
                if (entity) {
                    const changes = func(entity)
                    if (changes) {
                        t.update(entityRef, changes)
                    }
                }
            })
        } catch (e) {
            throw e
        }
    }
}
