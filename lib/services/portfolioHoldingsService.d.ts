import { TPortfolioHoldingUpdateItem, TTransaction } from '..';
export declare class PortfolioHoldingsService {
    private assetRepository;
    private portfolioHoldingsRepository;
    private portfolioActivityRepository;
    private assetHoldersRepository;
    constructor();
    newPortfolioHolding(portfolioId: string, assetId: string): Promise<{
        portfolioId: string;
        assetId: string;
        units: number;
        displayName: string;
        net: number;
        cost: number;
    } | null>;
    proessTransaction(transactionId: string, updateSet: TPortfolioHoldingUpdateItem[], transaction: TTransaction): Promise<void>;
    scrubPortfolioHoldings(portfolioId: string): Promise<void[]>;
    scrubAssetHolders(assetId: string): Promise<void[]>;
    deletePortfolioHolding(portfolioId: string, assetId: string): Promise<void[]>;
    getPortfolioHoldingBalance(portfolioId: string, assetId: string): Promise<number>;
}
