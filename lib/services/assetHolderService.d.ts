import { AssetRepository, TAssetHolderUpdateItem, TTransaction } from '..';
export declare class AssetHolderService {
    private assetRepository;
    private portfolioHoldingRepository;
    private activityRepository;
    private assetHolderRepository;
    constructor(assetRepository: AssetRepository);
    createAssetHolder(assetId: string, portfolioId: string): Promise<{
        portfolioId: string;
        assetId: string;
        units: number;
        displayName: any;
    } | null>;
    processTransaction(updateSet: TAssetHolderUpdateItem[], transaction: TTransaction): Promise<void>;
    deleteAssetHolder(assetId: string, portfolioId: string): Promise<void[]>;
    getAssetHoldingTotal(assetId: string): Promise<number>;
    getAssetHolderBalance(assetId: string, portfolioId: string): Promise<number>;
    getPortfolioHoldingBalance(portfolioId: string, assetId: string): Promise<number>;
}
