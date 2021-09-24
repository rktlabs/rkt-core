import { PortfolioRepository, AssetRepository, TNewAssetConfig, Asset } from '..';
export declare class AssetService {
    private portfolioRepository;
    private assetRepository;
    private portfolioService;
    private marketMakerService;
    private assetHolderService;
    constructor(assetRepository: AssetRepository, portfolioRepository: PortfolioRepository);
    createAsset(payload: TNewAssetConfig, shouldCreatePortfolio?: boolean): Promise<Asset>;
    deleteAsset(assetId: string): Promise<void>;
    scrubAsset(assetId: string): Promise<void>;
    private createAssetImpl;
    private createAssetPortfolioImpl;
}
