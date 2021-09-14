import { TNewAsset, Asset } from '..';
export declare class AssetService {
    private portfolioRepository;
    private assetRepository;
    private portfolioService;
    private leagueService;
    private makerService;
    private portfolioHoldingService;
    constructor();
    newAsset(payload: TNewAsset, shouldCreatePortfolio?: boolean): Promise<Asset>;
    deleteAsset(assetId: string): Promise<void>;
    scrubAsset(assetId: string): Promise<void>;
    private createAssetImpl;
    private createAssetPortfolioImpl;
}
