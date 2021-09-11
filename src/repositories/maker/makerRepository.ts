'use strict'
import { TMaker, TMakerPatch } from '../../models/maker'
import { deleteDocument } from '../../util/deleters'

import { getConnectionProps } from '../getConnectionProps'
import { RepositoryBase } from '../repositoryBase'

const COLLECTION_NAME = 'makers'

export class MakerRepository extends RepositoryBase {
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
        entityRefCollection = this.generatePagingProperties(qs, entityRefCollection, 'makerId')
        const entityCollectionRefs = await entityRefCollection.get()
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
        const entityId = entity.assetId
        const entityData = JSON.parse(JSON.stringify(entity))
        const entityRef = this.db.collection(COLLECTION_NAME).doc(entityId)
        await entityRef.set(entityData)
    }

    async updateAsync(makerId: string, entityData: TMakerPatch) {
        const entityRef = this.db.collection(COLLECTION_NAME).doc(makerId)
        await entityRef.update(entityData)
    }

    async deleteAsync(makerId: string) {
        const entityRef = this.db.collection(COLLECTION_NAME).doc(makerId)
        await deleteDocument(entityRef)
    }

    async isPortfolioUsed(portfolioId: string) {
        // check for linked makers
        const entityRefCollection = this.db.collection('makers').where('portfolioId', '==', portfolioId)
        const entityCollectionRefs = await entityRefCollection.get()
        if (entityCollectionRefs.size > 0) {
            const ids = entityCollectionRefs.docs.map((doc) => {
                const data = doc.data()
                return data.assetId
            })

            const idList = ids.join(', ')
            return idList
        } else {
            return null
        }
    }
}
