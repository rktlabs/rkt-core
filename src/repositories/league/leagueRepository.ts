'use strict'
import { TAssetCore } from '../..'
import { TLeague, TLeagueUpdate } from '../../models/league'
import { deleteDocument } from '../../util/deleters'
import { getConnectionProps } from '../getConnectionProps'
import { RepositoryBase } from '../repositoryBase'

const COLLECTION_NAME = 'leagues'

export class LeagueRepository extends RepositoryBase {
    db: FirebaseFirestore.Firestore
    constructor() {
        super()
        this.db = getConnectionProps()
    }

    filterMap: any = {
        leagueId: 'leagueId',
        contracId: 'contracId',
        type: 'type',
    }

    async getListAsync(qs?: any) {
        let entityRefCollection: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> =
            this.db.collection(COLLECTION_NAME)

        entityRefCollection = this.generateFilterPredicate(qs, this.filterMap, entityRefCollection)
        entityRefCollection = this.generatePagingProperties(qs, entityRefCollection, 'leagueId')
        const entityCollectionRefs = await entityRefCollection.get()
        if (!entityCollectionRefs.empty) {
            const leagueList = entityCollectionRefs.docs.map((entityDoc) => {
                const entity = entityDoc.data() as TLeague
                return entity
            })
            return leagueList
        } else {
            return []
        }
    }

    async getDetailAsync(leagueId: string) {
        const entityRef = this.db.collection(COLLECTION_NAME).doc(leagueId)
        const entityDoc = await entityRef.get()

        if (!entityDoc.exists) {
            return null
        } else {
            const entity = entityDoc.data() as TLeague
            return entity
        }
    }

    async storeAsync(entity: TLeague) {
        const entityId = entity.leagueId
        const entityData = JSON.parse(JSON.stringify(entity))
        const entityRef = this.db.collection(COLLECTION_NAME).doc(entityId)
        await entityRef.set(entityData)
    }

    async updateAsync(leagueId: string, entityData: TLeagueUpdate) {
        const entityRef = this.db.collection(COLLECTION_NAME).doc(leagueId)
        await entityRef.update(entityData)
    }

    async deleteAsync(leagueId: string) {
        const entityRef = this.db.collection(COLLECTION_NAME).doc(leagueId)
        await deleteDocument(entityRef)
    }

    async isPortfolioUsed(portfolioId: string) {
        // check for linked leagues
        const entityRefCollection = this.db.collection('leagues').where('portfolioId', '==', portfolioId)
        const entityCollectionRefs = await entityRefCollection.get()
        if (entityCollectionRefs.size > 0) {
            const ids = entityCollectionRefs.docs.map((doc) => {
                const data = doc.data()
                return data.leagueId
            })

            const idList = ids.join(', ')
            return idList
        } else {
            return null
        }
    }

    async detachLeagueAsset(leagueId: string, assetId: string) {
        const entityRef = this.db.collection(COLLECTION_NAME).doc(leagueId)
        await this.db.runTransaction(async (t) => {
            const entityDoc = await t.get(entityRef)
            if (entityDoc.exists) {
                const entity = entityDoc.data()
                if (entity) {
                    const assetList = entity.managedAssets || []
                    const newAssetList = assetList.filter((target: TAssetCore) => {
                        return target.assetId != assetId
                    })
                    t.update(entityRef, { managedAssets: newAssetList })
                }
            }
        })
    }

    async attachLeagueAsset(leagueId: string, asset: TAssetCore) {
        const entityRef = this.db.collection(COLLECTION_NAME).doc(leagueId)
        await this.db.runTransaction(async (t) => {
            const entityDoc = await t.get(entityRef)
            if (entityDoc.exists) {
                const entity = entityDoc.data() as TLeague
                if (entity) {
                    const assetList = entity.managedAssets || []
                    const newAssetList = [...assetList, { assetId: asset.assetId, displayName: asset.displayName }]
                    t.update(entityRef, { managedAssets: newAssetList })
                }
            }
        })
    }
}
