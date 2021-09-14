'use strict'
import { TUser } from '../..'
import { deleteDocument } from '../../util/deleters'
import { getConnectionProps } from '../getConnectionProps'
import { RepositoryBase } from '../repositoryBase'

// import * as admin from 'firebase-admin'
// const FieldValue = admin.firestore.FieldValue

const COLLECTION_NAME = 'users'

export class UserRepository extends RepositoryBase {
    db: FirebaseFirestore.Firestore
    constructor() {
        super()
        this.db = getConnectionProps()
    }

    filterMap: any = {
        username: 'username',
        email: 'email',
    }

    async getListAsync(qs?: any) {
        let entityRefCollection: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> =
            this.db.collection(COLLECTION_NAME)

        entityRefCollection = this.generateFilterPredicate(qs, this.filterMap, entityRefCollection)
        entityRefCollection = this.generatePagingProperties(qs, entityRefCollection)
        const entityCollectionRefs = await entityRefCollection.get()

        if (!entityCollectionRefs.empty) {
            const userList = entityCollectionRefs.docs.map((entityDoc) => {
                const entity = entityDoc.data() as TUser
                const userId = entityDoc.id
                entity.userId = userId // EJH: if not set in initial set
                return entity
            })
            return userList
        } else {
            return []
        }
    }

    async getDetailAsync(userId: string) {
        const entityRef = this.db.collection(COLLECTION_NAME).doc(userId)
        const entityDoc = await entityRef.get()

        if (!entityDoc.exists) {
            return null
        } else {
            const entity = entityDoc.data() as TUser
            const userId = entityDoc.id
            entity.userId = userId // EJH: if not set in initial set
            return entity
        }
    }

    async lookupUserByUserNameAsync(username: string) {
        const entityRefCollection = this.db.collection(COLLECTION_NAME).where('username', '==', username)
        const entityCollectionRefs = await entityRefCollection.get()
        if (!entityCollectionRefs.empty) {
            const userList = entityCollectionRefs.docs.map((entityDoc) => {
                const entity = entityDoc.data() as TUser
                const userId = entityDoc.id
                entity.userId = userId // EJH: not set in initial set
                return entity
            })
            return userList[0]
        } else {
            return null
        }
    }

    async lookupUserByEmailAsync(email: string) {
        const entityRefCollection = this.db.collection(COLLECTION_NAME).where('email', '==', email)
        const entityCollectionRefs = await entityRefCollection.get()
        if (!entityCollectionRefs.empty) {
            const userList = entityCollectionRefs.docs.map((entityDoc) => {
                const entity = entityDoc.data() as TUser
                const userId = entityDoc.id
                entity.userId = userId // EJH: not set in initial set
                return entity
            })
            return userList[0]
        } else {
            return null
        }
    }

    async storeAsync(entity: TUser) {
        const entityId = entity.userId
        const entityData = JSON.parse(JSON.stringify(entity))
        const entityRef = this.db.collection(COLLECTION_NAME).doc(entityId)
        await entityRef.set(entityData)
    }

    async deleteAsync(userId: string) {
        const entityRef = this.db.collection(COLLECTION_NAME).doc(userId)
        await deleteDocument(entityRef)
    }

    // async updateUser(userId: string, entityData: TUserUpdate) {
    //     const entityRef = this.db.collection(COLLECTION_NAME).doc(userId)
    //     await entityRef.update(entityData)
    // }
}
