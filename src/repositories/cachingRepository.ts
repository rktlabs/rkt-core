'use strict'

import { RepositoryBase } from './repositoryBase'

export class CachingRepository extends RepositoryBase {
    entityCache: any

    constructor() {
        super()
        this.entityCache = {}
    }

    cacheLookup(entityId: string) {
        const cachedItem = this.entityCache[entityId]
        return cachedItem
    }

    cacheEntity(entityId: string, entity: any) {
        this.entityCache[entityId] = entity
    }

    cacheClear(entityId: string) {
        delete this.entityCache[entityId]
    }
}
