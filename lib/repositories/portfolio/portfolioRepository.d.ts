import { TPortfolio, TPortfolioUpdate as TPortfolioUpdate } from '../..';
import { CachingRepository } from '../cachingRepository';
export declare class PortfolioRepository extends CachingRepository {
    db: FirebaseFirestore.Firestore;
    constructor();
    filterMap: any;
    getListAsync(qs?: any): Promise<TPortfolio[]>;
    getDetailAsync(entityId: string): Promise<any>;
    storeAsync(entity: TPortfolio): Promise<void>;
    updateAsync(entityId: string, entityData: TPortfolioUpdate): Promise<void>;
    deleteAsync(entityId: string): Promise<void>;
}
