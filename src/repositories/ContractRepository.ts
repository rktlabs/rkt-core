'use strict'
import { TContract, TContractUpdate } from '../models/contract'
import { deleteDocument } from '../util/deleters'

const COLLECTION_NAME = 'contracts'

export class ContractRepository {
    db: FirebaseFirestore.Firestore
    constructor(db: FirebaseFirestore.Firestore) {
        this.db = db
    }

    async listContracts(qs?: any) {
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
            const contractList = entityCollectionRefs.docs.map((entityDoc) => {
                const entity = entityDoc.data() as TContract
                // entity.idd = entityDoc.id;
                return entity
            })
            return contractList
        } else {
            return []
        }
    }

    async getContract(contractId: string) {
        const entityRef = this.db.collection(COLLECTION_NAME).doc(contractId)
        const entityDoc = await entityRef.get()

        if (!entityDoc.exists) {
            return null
        } else {
            const entity = entityDoc.data() as TContract
            return entity
        }
    }

    async storeContract(entity: TContract) {
        const entityId = entity.contractId
        const entityData = JSON.parse(JSON.stringify(entity))
        const entityRef = this.db.collection(COLLECTION_NAME).doc(entityId)
        await entityRef.set(entityData)
    }

    async updateContract(contractId: string, entityData: TContractUpdate) {
        const entityRef = this.db.collection(COLLECTION_NAME).doc(contractId)
        await entityRef.update(entityData)
    }

    async dropContractAsset(contractId: string, assetId: string) {
        const entityRef = this.db.collection(COLLECTION_NAME).doc(contractId)
        await this.db.runTransaction(async (t) => {
            const entityDoc = await t.get(entityRef)
            if (entityDoc.exists) {
                const entity = entityDoc.data()
                if (entity) {
                    const assetList = entity.managedAssets || []
                    const newAssetList = assetList.filter((targetId: string) => {
                        return targetId != assetId
                    })
                    t.update(entityRef, { managedAssets: newAssetList })
                }
            }
        })
    }

    async addContractAsset(contractId: string, assetId: string) {
        const entityRef = this.db.collection(COLLECTION_NAME).doc(contractId)
        await this.db.runTransaction(async (t) => {
            const entityDoc = await t.get(entityRef)
            if (entityDoc.exists) {
                const entity = entityDoc.data() as TContract
                if (entity) {
                    const assetList = entity.managedAssets || []
                    const newAssetList = [...assetList, assetId]
                    t.update(entityRef, { managedAssets: newAssetList })
                }
            }
        })
    }

    async deleteContract(contractId: string) {
        const entityRef = this.db.collection(COLLECTION_NAME).doc(contractId)
        await deleteDocument(entityRef)
    }
}
