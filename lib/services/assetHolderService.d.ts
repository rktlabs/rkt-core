import { TAssetHolderUpdateItem, TTransaction } from '..';
export declare class AssetHolderService {
    private assetRepository;
    private portfolioHoldingRepository;
    private portfolioActivityRepository;
    private assetHolderRepository;
    constructor();
    addAssetHolder(portfolioId: string, assetId: string): Promise<{
        portfolioId: string;
        assetId: string;
        units: number;
        displayName: string;
        net: number;
        cost: number;
    } | null>;
    proessTransaction(transactionId: string, updateSet: TAssetHolderUpdateItem[], transaction: TTransaction): Promise<void>;
    scrubPortfolioHoldings(portfolioId: string): Promise<void[]>;
    scrubAssetHolders(assetId: string): Promise<void[]>;
    deleteAssetHolder(assetId: string, portfolioId: string): Promise<void[]>;
    deletePortfolioHolding(portfolioId: string, assetId: string): Promise<void[]>;
    getAssetHoldingTotal(assetId: string): Promise<number>;
    getAssetHoldingBalance(assetId: string, portfolioId: string): Promise<number>;
    getPortfolioHoldingBalance(portfolioId: string, assetId: string): Promise<number>;
}