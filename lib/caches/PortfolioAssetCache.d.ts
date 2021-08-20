import { TPortfolioAssetCache } from '..';
import { ICache } from './ICache';
export declare class PortfolioAssetCache implements ICache {
    db: FirebaseFirestore.Firestore;
    constructor(db: FirebaseFirestore.Firestore);
    getPortfolioAsset(portfolioId: string, assetId: string): Promise<TPortfolioAssetCache | null>;
}
