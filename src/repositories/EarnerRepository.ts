'use strict'
import { TEarner } from '..'
import { deleteDocument } from '../util/deleters'
import { IRepository } from './IRepository'

import * as admin from 'firebase-admin'
const FieldValue = admin.firestore.FieldValue

const COLLECTION_NAME = 'earners'

export class EarnerRepository implements IRepository {
    db: FirebaseFirestore.Firestore
    constructor(db: FirebaseFirestore.Firestore) {
        this.db = db
    }

    async listEarners(qs?: any) {
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
        const entityCollectionRefs = await entityRefCollection.orderBy('earnerId').offset(start).limit(pageSize).get()
        if (!entityCollectionRefs.empty) {
            const earnerList = entityCollectionRefs.docs.map((entityDoc) => {
                const entity = entityDoc.data() as TEarner
                // entity.idd = entityDoc.id;
                return entity
            })
            return earnerList
        } else {
            return []
        }
    }

    async getEarner(earnerId: string) {
        const entityRef = this.db.collection(COLLECTION_NAME).doc(earnerId)
        const entityDoc = await entityRef.get()

        if (!entityDoc.exists) {
            return null
        } else {
            const entity = entityDoc.data() as TEarner
            return entity
        }
    }

    async storeEarner(entity: TEarner) {
        const entityId = entity.earnerId
        const entityData = JSON.parse(JSON.stringify(entity))
        const entityRef = this.db.collection(COLLECTION_NAME).doc(entityId)
        await entityRef.set(entityData)
    }

    async adjustCumulativeEarnings(earnerId: string, cumulativeEarningsDelta: number) {
        const entityRef = this.db.collection(COLLECTION_NAME).doc(earnerId)
        const data = {
            cumulativeEarnings: FieldValue.increment(cumulativeEarningsDelta),
        }
        await entityRef.update(data)
    }

    async deleteEarner(earnerId: string) {
        const entityRef = this.db.collection(COLLECTION_NAME).doc(earnerId)
        await deleteDocument(entityRef)
    }
}
