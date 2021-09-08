import { TPortfolioHolding } from '..';
import { RepositoryBase } from './repositoryBase';
export declare class PortfolioHoldingsRepository extends RepositoryBase {
    db: FirebaseFirestore.Firestore;
    constructor();
    filterMap: any;
    getListAsync(portfolioId: string, qs?: any): Promise<TPortfolioHolding[]>;
    getDetailAsync(portfolioId: string, assetId: string): Promise<TPortfolioHolding | null>;
    storeAsync(portfolioId: string, assetId: string, entity: TPortfolioHolding): Promise<void>;
    deletePAsync(portfolioId: string, assetId: string): Promise<void>;
}
