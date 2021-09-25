import { AssetRepository, PortfolioRepository, TransactionRepository, UserRepository, MarketMakerRepository, LeagueRepository } from '..';
export declare class BootstrapService {
    private userService;
    private assetService;
    private portfolioService;
    private leagueService;
    private marketMakerService;
    constructor(assetRepository: AssetRepository, portfolioRepository: PortfolioRepository, transactionRepository: TransactionRepository, userRepository: UserRepository, marketMakerRepository: MarketMakerRepository, leagueRepository: LeagueRepository);
    bootRkt(): Promise<void>;
    bootBank(): Promise<void>;
    bootLeague(): Promise<void>;
    bootUser(): Promise<void>;
    bootAsset(assetId: string): Promise<void>;
    bootAssets(): Promise<void>;
    bootstrap(): Promise<void>;
}
