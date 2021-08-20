import { TPortfolioAsset } from '..';
import { IRepository } from './IRepository';
export declare class PortfolioAssetRepository implements IRepository {
    db: FirebaseFirestore.Firestore;
    constructor(db: FirebaseFirestore.Firestore);
    listPortfolioAssets(portfolioId: string): Promise<TPortfolioAsset[]>;
    getPortfolioAsset(portfolioId: string, assetId: string): Promise<TPortfolioAsset | null>;
    storePortfolioAsset(portfolioId: string, assetId: string, entity: TPortfolioAsset): Promise<void>;
    deletePortfolioAsset(portfolioId: string, assetId: string): Promise<void>;
}
