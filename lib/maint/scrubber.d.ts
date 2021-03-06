import { AssetRepository, PortfolioRepository, TransactionRepository, UserRepository, MarketMakerRepository, LeagueRepository, AssetHolderRepository, PortfolioHoldingRepository } from '..';
export declare class Scrubber {
    db: FirebaseFirestore.Firestore;
    assetRepository: AssetRepository;
    portfolioRepository: PortfolioRepository;
    userRepository: UserRepository;
    transactionRepository: TransactionRepository;
    marketMakerRepository: MarketMakerRepository;
    leagueRepository: LeagueRepository;
    assetHolderRepository: AssetHolderRepository;
    portfolioHoldingRepository: PortfolioHoldingRepository;
    static scrub(): Promise<void>;
    constructor(repos?: any);
    scrubTransactionCollectionAsync(): Promise<void>;
    scrubPortfolioDepositsAsync(portfolioId: string): Promise<void>;
    scrubExchangeOrderCollectionAsync(): Promise<void>;
    scrubExchangeTradeCollectionAsync(): Promise<void>;
    scrubAssetHolders(assetId: string): Promise<void>;
    scrubMarketMaker(assetId: string): Promise<void>;
    scrubAsset(assetId: string): Promise<void>;
    scrubLeague(leagueId: string): Promise<void>;
    scrubLeagueAsset(assetId: string): Promise<void>;
    scrubPortfolio(portfolioId: string): Promise<void>;
    scrubUser(userId: string): Promise<void>;
    scrubPortfolioHoldings(portfolioId: string): Promise<void>;
    scrubRkt(): Promise<void>;
    scrubBank(): Promise<void>;
    scrubLeague2(): Promise<void>;
    scrubUser2(): Promise<void>;
    scrubAsset2(assetId: string): Promise<void>;
    scrubAssets(): Promise<void>;
    scrub(): Promise<void>;
}
