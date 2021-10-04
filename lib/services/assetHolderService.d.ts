import { AssetRepository, TActivityUpdateItem, TTransaction, TPortfolioHolding } from '..';
export declare class AssetHolderService {
    private assetRepository;
    private portfolioHoldingRepository;
    private activityRepository;
    private assetHolderRepository;
    constructor(assetRepository: AssetRepository);
    createAssetHolder(assetId: string, portfolioId: string): Promise<TPortfolioHolding | null>;
    processTransaction(updateSet: TActivityUpdateItem[], transaction: TTransaction): Promise<void>;
    deleteAssetHolder(assetId: string, portfolioId: string): Promise<void[]>;
    getAssetHoldingTotal(assetId: string): Promise<number>;
    getAssetHolderBalance(assetId: string, portfolioId: string): Promise<number>;
    getPortfolioHoldingBalance(portfolioId: string, assetId: string): Promise<number>;
}
