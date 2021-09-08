import { TPortfolioHolding } from '..';
import { RepositoryBase } from './repositoryBase';
export declare class PortfolioHoldingsRepository extends RepositoryBase {
    db: FirebaseFirestore.Firestore;
    constructor();
    listPortfolioHoldings(portfolioId: string): Promise<TPortfolioHolding[]>;
    getPortfolioHolding(portfolioId: string, assetId: string): Promise<TPortfolioHolding | null>;
    storePortfolioHolding(portfolioId: string, assetId: string, entity: TPortfolioHolding): Promise<void>;
    deletePortfolioHolding(portfolioId: string, assetId: string): Promise<void>;
}
