import { TPortfolio, TPortfolioUpdate as TPortfolioUpdate } from '..';
import { RepositoryBase } from './repositoryBase';
export declare class PortfolioRepository extends RepositoryBase {
    db: FirebaseFirestore.Firestore;
    constructor();
    filterMap: any;
    getListAsync(qs?: any): Promise<TPortfolio[]>;
    getDetailAsync(entityId: string): Promise<TPortfolio | null>;
    storePortfolioAsync(entity: TPortfolio): Promise<void>;
    updatePortfolioAsync(entityId: string, entityData: TPortfolioUpdate): Promise<void>;
    deletePortfolioAsync(entityId: string): Promise<void>;
}
