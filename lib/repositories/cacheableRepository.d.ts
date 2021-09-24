import { RepositoryBase } from './repositoryBase';
export declare class CacheableRepository extends RepositoryBase {
    entityCache: any;
    constructor();
    cacheLookup(entityId: string): any;
    cacheEntity(entityId: string, entity: any): void;
    cacheClear(entityId: string): void;
}
