import { IEventPublisher } from '.';
import { TPortfolioAssetUpdateItem, TTransaction } from '../models';
export declare class PortfolioAssetService {
    private db;
    private eventPublisher;
    private assetRepository;
    private portfolioAssetRepository;
    private portfolioActivityRepository;
    private assetHolderRepository;
    constructor(db: FirebaseFirestore.Firestore, eventPublisher?: IEventPublisher);
    newPortfolioAsset(portfolioId: string, assetId: string): Promise<{
        portfolioId: string;
        assetId: string;
        units: number;
        displayName: string;
        net: number;
        cost: number;
    } | null>;
    proessTransaction(transactionId: string, updateSet: TPortfolioAssetUpdateItem[], transaction: TTransaction): Promise<void>;
    scrubPortfolioAssets(portfolioId: string): Promise<void[]>;
    scrubAssetHolders(assetId: string): Promise<void[]>;
    scrubPortfolioAsset(portfolioId: string, assetId: string): Promise<void[]>;
    getPortfolioAssetBalance(portfolioId: string, assetId: string): Promise<number>;
}
