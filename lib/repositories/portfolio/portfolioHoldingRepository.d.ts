import { TPortfolioHolding } from '../..';
import { RepositoryBase } from '../repositoryBase';
export declare class PortfolioHoldingRepository extends RepositoryBase {
    db: FirebaseFirestore.Firestore;
    constructor();
    getListAsync(portfolioId: string, qs?: any): Promise<TPortfolioHolding[]>;
    getDetailAsync(portfolioId: string, assetId: string): Promise<TPortfolioHolding | null>;
    storeAsync(portfolioId: string, assetId: string, entity: TPortfolioHolding): Promise<void>;
    deleteAsync(portfolioId: string, assetId: string): Promise<void>;
}
