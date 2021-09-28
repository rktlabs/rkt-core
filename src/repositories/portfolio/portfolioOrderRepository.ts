'use strict'

import * as admin from 'firebase-admin'
import { TPortfolioOrder, TPortfolioOrderPatch } from '../../models/portfolioOrder'
import { getConnectionProps } from '../getConnectionProps'
import { RepositoryBase } from '../repositoryBase'
const FieldValue = admin.firestore.FieldValue

const COLLECTION_NAME = 'portfolios'
const SUB_COLLECTION_NAME = 'orders'

export class PortfolioOrderRepository extends RepositoryBase {
    db: FirebaseFirestore.Firestore
    constructor() {
        super()
        this.db = getConnectionProps()
    }

    filterMap: any = {
        status: 'status',
    }

    async getListAsync(portfolioId: string, qs?: any) {
        let entityRefCollection: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = this.db
            .collection(COLLECTION_NAME)
            .doc(portfolioId)
            .collection(SUB_COLLECTION_NAME)

        entityRefCollection = this.generateFilterPredicate(qs, this.filterMap, entityRefCollection)
        entityRefCollection = this.generatePagingProperties(qs, entityRefCollection)
        const entityCollectionRefs = await entityRefCollection.get()

        const entityList = entityCollectionRefs.docs.map((entityDoc) => {
            const entity = entityDoc.data() as TPortfolioOrder
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
        const entity = entityDoc.data() as TPortfolioOrder
        return entity
    }

    async storeAsync(portfolioId: string, entity: TPortfolioOrder) {
        const entityJson = JSON.parse(JSON.stringify(entity))
        const entityRef = await this.db
            .collection(COLLECTION_NAME)
            .doc(portfolioId)
            .collection(SUB_COLLECTION_NAME)
            .doc(entity.orderId)

        await entityRef.set(entityJson)
    }

    async updateAsync(portfolioId: string, orderId: string, entityJson: TPortfolioOrderPatch) {
        const entityRef = this.db
            .collection(COLLECTION_NAME)
            .doc(portfolioId)
            .collection(SUB_COLLECTION_NAME)
            .doc(orderId)
        await entityRef.update(entityJson)
    }

    async appendOrderEvent(portfolioId: string, orderId: string, payload: any) {
        const eventPayload = { ...payload }
        delete eventPayload.portfolioId
        delete eventPayload.orderId
        delete eventPayload.sizeRemaining

        const entityRef = this.db
            .collection(COLLECTION_NAME)
            .doc(portfolioId)
            .collection(SUB_COLLECTION_NAME)
            .doc(orderId)

        await entityRef.update({ events: FieldValue.arrayUnion(eventPayload) })
    }
}
