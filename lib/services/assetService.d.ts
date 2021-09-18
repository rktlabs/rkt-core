import { TNewAssetConfig, Asset } from '..';
export declare class AssetService {
    private portfolioRepository;
    private assetRepository;
    private portfolioService;
    private makerService;
    private assetHolderService;
    constructor();
    createAsset(payload: TNewAssetConfig, shouldCreatePortfolio?: boolean): Promise<Asset>;
    deleteAsset(assetId: string): Promise<void>;
    scrubAsset(assetId: string): Promise<void>;
    private createAssetImpl;
    private createAssetPortfolioImpl;
}
