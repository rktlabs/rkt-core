import { TPortfolio, TPortfolioPatch as TPortfolioUpdate } from '..';
import { RepositoryBase } from './repositoryBase';
export declare class PortfolioRepository extends RepositoryBase {
    db: FirebaseFirestore.Firestore;
    constructor();
    filterMap: any;
    listPortfolios(qs?: any): Promise<TPortfolio[]>;
    getPortfolio(entityId: string): Promise<TPortfolio | null>;
    storePortfolio(entity: TPortfolio): Promise<void>;
    updatePortfolio(entityId: string, entityData: TPortfolioUpdate): Promise<void>;
    deletePortfolio(entityId: string): Promise<void>;
}
