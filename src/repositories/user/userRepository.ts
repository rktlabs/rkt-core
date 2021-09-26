'use strict'

import * as log4js from 'log4js'
import { TUser } from '../..'
import { deleteDocument } from '../../util/deleters'
import { CacheableRepository } from '../cacheableRepository'
import { getConnectionProps } from '../getConnectionProps'

const logger = log4js.getLogger('userRepository')

const COLLECTION_NAME = 'users'

export class UserRepository extends CacheableRepository {
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
        //logger.trace(`getList ${qs}`)
        let entityRefCollection: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> =
            this.db.collection(COLLECTION_NAME)

        entityRefCollection = this.generateFilterPredicate(qs, this.filterMap, entityRefCollection)
        entityRefCollection = this.generatePagingProperties(qs, entityRefCollection)
        const entityCollectionRefs = await entityRefCollection.get()

        if (!entityCollectionRefs.empty) {
            const userList = entityCollectionRefs.docs.map((entityDoc) => {
                const entity = entityDoc.data() as TUser
                return entity
            })
            return userList
        } else {
            return []
        }
    }

    async getDetailAsync(userId: string) {
        //logger.trace(`getDetail ${userId}`)
        const entityRef = this.db.collection(COLLECTION_NAME).doc(userId)
        const entityDoc = await entityRef.get()

        if (!entityDoc.exists) {
            return null
        } else {
            const entity = entityDoc.data() as TUser
            return entity
        }
    }

    async lookupUserByUserNameAsync(username: string) {
        logger.trace(`lookupUserByUserName ${username}`)
        const entityRefCollection = this.db.collection(COLLECTION_NAME).where('username', '==', username)
        const entityCollectionRefs = await entityRefCollection.get()
        if (!entityCollectionRefs.empty) {
            const userList = entityCollectionRefs.docs.map((entityDoc) => {
                const entity = entityDoc.data() as TUser
                return entity
            })
            return userList[0]
        } else {
            return null
        }
    }

    async lookupUserByEmailAsync(email: string) {
        logger.trace(`lookupUserByEmail ${email}`)
        const entityRefCollection = this.db.collection(COLLECTION_NAME).where('email', '==', email)
        const entityCollectionRefs = await entityRefCollection.get()
        if (!entityCollectionRefs.empty) {
            const userList = entityCollectionRefs.docs.map((entityDoc) => {
                const entity = entityDoc.data() as TUser
                return entity
            })
            return userList[0]
        } else {
            return null
        }
    }

    async storeAsync(entity: TUser) {
        logger.trace(`store ${entity.userId}`)
        const entityId = entity.userId
        const entityData = JSON.parse(JSON.stringify(entity))
        const entityRef = this.db.collection(COLLECTION_NAME).doc(entityId)
        await entityRef.set(entityData)
    }

    async deleteAsync(userId: string) {
        logger.trace(`delete ${userId}`)
        const entityRef = this.db.collection(COLLECTION_NAME).doc(userId)
        await deleteDocument(entityRef)
    }

    async isPortfolioUsed(portfolioId: string) {
        // check for linked leagues
        const entityRefCollection = this.db.collection(COLLECTION_NAME).where('portfolioId', '==', portfolioId)
        const entityCollectionRefs = await entityRefCollection.get()
        if (entityCollectionRefs.size > 0) {
            const ids = entityCollectionRefs.docs.map((doc) => {
                const data = doc.data()
                return data.userId
            })

            const idList = ids.join(', ')
            return idList
        } else {
            return null
        }
    }
}
