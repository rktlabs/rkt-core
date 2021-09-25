import { AssetRepository, LeagueRepository, PortfolioRepository, TNewLeagueConfig, League, TLeagueAssetDef, TAssetCore, TransactionRepository, MarketMakerRepository } from '..';
export declare class LeagueService {
    private assetRepository;
    private leagueRepository;
    private portfolioRepository;
    private portfolioService;
    private assetService;
    constructor(leagueRepository: LeagueRepository, assetRepository: AssetRepository, portfolioRepository: PortfolioRepository, marketMakerRepository: MarketMakerRepository, transactionRepository: TransactionRepository);
    createLeague(payload: TNewLeagueConfig): Promise<League>;
    deleteLeague(leagueId: string): Promise<void>;
    scrubLeague(leagueId: string): Promise<void>;
    scrubLeagueAsset(leagueId: string, assetId: string): Promise<any[]>;
    createAsset(leagueSpec: string | League, assetDef: TLeagueAssetDef): Promise<void>;
    attachAsset(leagueSpec: string | League, asset: TAssetCore): Promise<void>;
    detachAsset(leagueSpec: string | League, assetId: string): Promise<void>;
    private createLeagueImpl;
    private attachAssetToLeague;
    private detachAssetFromLeague;
    private createLeaguePortfolioImpl;
    private createAssetImpl;
}
