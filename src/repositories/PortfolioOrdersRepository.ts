'use strict'
import { TOrder, TOrderPatch } from '../models/portfolioOrder'
import { getConnectionProps } from './getConnectionProps'
import { RepositoryBase } from './repositoryBase'

const COLLECTION_NAME = 'portfolios'
const SUB_COLLECTION_NAME = 'orders'

export class PortfolioOrdersRepository extends RepositoryBase {
    db: FirebaseFirestore.Firestore
    constructor() {
        super()
        this.db = getConnectionProps()
    }

    async getListAsync(portfolioId: string, filter: any) {
        let entityCollectionRef: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = this.db
            .collection(COLLECTION_NAME)
            .doc(portfolioId)
            .collection(SUB_COLLECTION_NAME)

        for (const filterParm in filter) {
            if (Array.isArray(filter[filterParm])) {
                const filterValues = filter[filterParm]
                entityCollectionRef = entityCollectionRef.where(filterParm, 'in', filterValues)
            } else {
                const filterValue = filter[filterParm]
                entityCollectionRef = entityCollectionRef.where(filterParm, '==', filterValue)
            }
        }

        const entityRefCollection = await entityCollectionRef.limit(1000).get()
        const entityList = entityRefCollection.docs.map((entityDoc) => {
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

    async updatePortfolioOrder(portfolioId: string, orderId: string, entityJson: TOrderPatch) {
        const entityRef = this.db
            .collection(COLLECTION_NAME)
            .doc(portfolioId)
            .collection(SUB_COLLECTION_NAME)
            .doc(orderId)
        await entityRef.update(entityJson)
    }

    async atomicUpdateO(portfolioId: string, orderId: string, func: (order: TOrder) => TOrder | undefined) {
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
