'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.CachingRepository = void 0;
const repositoryBase_1 = require("./repositoryBase");
class CachingRepository extends repositoryBase_1.RepositoryBase {
    constructor() {
        super();
        this.entityCache = {};
    }
    cacheLookup(entityId) {
        const cachedItem = this.entityCache[entityId];
        return cachedItem;
    }
    cacheEntity(entityId, entity) {
        this.entityCache[entityId] = entity;
    }
    cacheClear(entityId) {
        delete this.entityCache[entityId];
    }
}
exports.CachingRepository = CachingRepository;
