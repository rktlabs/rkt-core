'use strict'
'use strict'
import { Earning, TEarning } from '..'
import { IRepository } from './IRepository'

const EARNER_COLLECTION_NAME = 'earners'
const ASSET_COLLECTION_NAME = 'assets'
const EARNING_COLLECTION_NAME = 'earnings'

export class EarningsRepository implements IRepository {
    db: FirebaseFirestore.Firestore
    constructor(db: FirebaseFirestore.Firestore) {
        this.db = db
    }

    async listEarnerEarnings(earnerId: string) {
        const entityCollectionRef = this.db
            .collection(EARNER_COLLECTION_NAME)
            .doc(earnerId)
            .collection(EARNING_COLLECTION_NAME)
            .orderBy('earnedAt', 'desc')
        const entityRefCollection = await entityCollectionRef.limit(1000).get()
        const entityList = entityRefCollection.docs.map((entityDoc) => {
            const entity = entityDoc.data() as TEarning
            return entity
        })

        return entityList
    }

    async storeEarnerEarning(earnerId: string, entity: TEarning) {
        const id = Earning.sig(entity)
        const entityData = JSON.parse(JSON.stringify(entity))
        const entityRef = this.db
            .collection(EARNER_COLLECTION_NAME)
            .doc(earnerId)
            .collection(EARNING_COLLECTION_NAME)
            .doc(id)
        await entityRef.set(entityData)
    }

    async listAssetEarnings(assetId: string) {
        const entityCollectionRef = this.db
            .collection(ASSET_COLLECTION_NAME)
            .doc(assetId)
            .collection(EARNING_COLLECTION_NAME)
            .orderBy('earnedAt', 'desc')
        const entityRefCollection = await entityCollectionRef.limit(1000).get()
        const entityList = entityRefCollection.docs.map((entityDoc) => {
            const entity = entityDoc.data() as TEarning
            return entity
        })

        return entityList
    }

    async storeAssetEarning(assetId: string, entity: TEarning) {
        const id = Earning.sig(entity)
        const entityData = JSON.parse(JSON.stringify(entity))
        const entityRef = this.db
            .collection(ASSET_COLLECTION_NAME)
            .doc(assetId)
            .collection(EARNING_COLLECTION_NAME)
            .doc(id)
        await entityRef.set(entityData)
    }
}
