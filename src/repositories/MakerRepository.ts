'use strict'
import { deleteDocument } from '../util/deleters'

import { getConnectionProps } from './getConnectionProps'
import { RepositoryBase } from './repositoryBase'
import { TMaker, TMakerUpdate } from '../models/maker'

const COLLECTION_NAME = 'makers'

export class MakerRepository extends RepositoryBase {
    db: FirebaseFirestore.Firestore
    constructor() {
        super()
        this.db = getConnectionProps()
    }

    filterMap: any = {}

    async getListAsync(qs?: any) {
        const filter = Object.assign({}, qs)
        const page = filter.page ? parseInt(filter.page, 10) : 1
        const pageSize = Math.min(filter.pageSize ? parseInt(filter.pageSize, 10) : 25, 1000)
        const start = (page - 1) * pageSize

        let entityRefCollection: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> =
            this.db.collection(COLLECTION_NAME)

        entityRefCollection = this.generateFilterPredicate(qs, this.filterMap, entityRefCollection)

        const entityCollectionRefs = await entityRefCollection.orderBy('makerId').offset(start).limit(pageSize).get()
        if (!entityCollectionRefs.empty) {
            const makerList = entityCollectionRefs.docs.map((entityDoc) => {
                const entity = entityDoc.data() as TMaker
                return entity
            })
            return makerList
        } else {
            return []
        }
    }

    async getDetailAsync(makerId: string) {
        const entityRef = this.db.collection(COLLECTION_NAME).doc(makerId)
        const entityDoc = await entityRef.get()

        if (!entityDoc.exists) {
            return null
        } else {
            const entity = entityDoc.data() as TMaker
            return entity
        }
    }

    async storeAsync(entity: TMaker) {
        const entityId = entity.makerId
        const entityData = JSON.parse(JSON.stringify(entity))
        const entityRef = this.db.collection(COLLECTION_NAME).doc(entityId)
        await entityRef.set(entityData)
    }

    async updateAsync(makerId: string, entityData: TMakerUpdate) {
        const entityRef = this.db.collection(COLLECTION_NAME).doc(makerId)
        await entityRef.update(entityData)
    }

    async deleteAsync(makerId: string) {
        const entityRef = this.db.collection(COLLECTION_NAME).doc(makerId)
        await deleteDocument(entityRef)
    }
}
