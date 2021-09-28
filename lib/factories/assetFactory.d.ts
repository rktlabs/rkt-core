import { PortfolioRepository, AssetRepository, TNewAssetConfig, Asset } from '..';
export declare class AssetFactory {
    private portfolioRepository;
    private assetRepository;
    private portfolioFactory;
    constructor(assetRepository: AssetRepository, portfolioRepository: PortfolioRepository);
    createAsset(payload: TNewAssetConfig, shouldCreatePortfolio?: boolean): Promise<Asset>;
    private _createAssetImpl;
    private _createAssetPortfolioImpl;
}
