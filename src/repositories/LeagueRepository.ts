'use strict'
import { TLeague, TLeagueUpdate } from '../models/league'
import { deleteDocument } from '../util/deleters'
import { getConnectionProps } from './getConnectionProps'
import { RepositoryBase } from './repositoryBase'

const COLLECTION_NAME = 'contracts'

export class LeagueRepository extends RepositoryBase {
    db: FirebaseFirestore.Firestore
    constructor() {
        super()
        this.db = getConnectionProps()
    }

    async getListAsync(qs?: any) {
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
        const entityCollectionRefs = await entityRefCollection.orderBy('contractId').offset(start).limit(pageSize).get()
        if (!entityCollectionRefs.empty) {
            const leagueList = entityCollectionRefs.docs.map((entityDoc) => {
                const entity = entityDoc.data() as TLeague
                // entity.idd = entityDoc.id;
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

    // async dropLeagueAsset(leagueId: string, assetId: string) {
    //     const entityRef = this.db.collection(COLLECTION_NAME).doc(leagueId)
    //     await this.db.runTransaction(async (t) => {
    //         const entityDoc = await t.get(entityRef)
    //         if (entityDoc.exists) {
    //             const entity = entityDoc.data()
    //             if (entity) {
    //                 const assetList = entity.managedAssets || []
    //                 const newAssetList = assetList.filter((targetId: string) => {
    //                     return targetId != assetId
    //                 })
    //                 t.update(entityRef, { managedAssets: newAssetList })
    //             }
    //         }
    //     })
    // }

    // async addLeagueAsset(leagueId: string, assetId: string) {
    //     const entityRef = this.db.collection(COLLECTION_NAME).doc(leagueId)
    //     await this.db.runTransaction(async (t) => {
    //         const entityDoc = await t.get(entityRef)
    //         if (entityDoc.exists) {
    //             const entity = entityDoc.data() as TLeague
    //             if (entity) {
    //                 const assetList = entity.managedAssets || []
    //                 const newAssetList = [...assetList, assetId]
    //                 t.update(entityRef, { managedAssets: newAssetList })
    //             }
    //         }
    //     })
    // }
}
