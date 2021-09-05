import { TPortfolioAsset } from '..';
import { RepositoryBase } from './repositoryBase';
export declare class PortfolioHoldingRepository extends RepositoryBase {
    db: FirebaseFirestore.Firestore;
    constructor();
    listPortfolioAssets(portfolioId: string): Promise<TPortfolioAsset[]>;
    getPortfolioAsset(portfolioId: string, assetId: string): Promise<TPortfolioAsset | null>;
    storePortfolioAsset(portfolioId: string, assetId: string, entity: TPortfolioAsset): Promise<void>;
    deletePortfolioAsset(portfolioId: string, assetId: string): Promise<void>;
}
