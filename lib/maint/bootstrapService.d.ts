import { AssetRepository, PortfolioRepository, TransactionRepository, UserRepository, MarketMakerRepository, LeagueRepository } from '..';
export declare class BootstrapService {
    private userFactory;
    private assetFactory;
    private portfolioFactory;
    private leagueFactory;
    private marketMakerFactory;
    private scrubber;
    static boot(): Promise<void>;
    constructor(assetRepository: AssetRepository, portfolioRepository: PortfolioRepository, transactionRepository: TransactionRepository, userRepository: UserRepository, marketMakerRepository: MarketMakerRepository, leagueRepository: LeagueRepository);
    bootRkt(): Promise<void>;
    bootBank(): Promise<void>;
    bootLeague(): Promise<void>;
    bootUser(): Promise<void>;
    bootAsset(assetId: string): Promise<void>;
    bootAssets(): Promise<void>;
    bootstrap(): Promise<void>;
}
