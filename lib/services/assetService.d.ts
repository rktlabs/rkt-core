import { Asset, TNewAsset } from '../models';
import { IEventPublisher } from '../services';
export declare class AssetService {
    private eventPublisher;
    private portfolioCache;
    private assetCache;
    private assetRepository;
    private portfolioService;
    private portfolioAssetService;
    constructor(db: FirebaseFirestore.Firestore, eventPublisher?: IEventPublisher);
    newAsset(payload: TNewAsset, shouldCreatePortfolio?: boolean): Promise<Asset>;
    deleteAsset(assetId: string): Promise<void>;
    scrubAsset(assetId: string): Promise<void>;
    private createAssetImpl;
    private createAssetPortfolioImpl;
}
