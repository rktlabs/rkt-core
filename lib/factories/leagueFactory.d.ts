import { AssetRepository, LeagueRepository, PortfolioRepository, MarketMakerRepository, TransactionRepository, TNewLeagueConfig, League, TLeagueAssetDef, TAssetCore } from '..';
export declare class LeagueFactory {
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
    private _createLeagueImpl;
    private _attachAssetToLeague;
    private _detachAssetFromLeague;
    private _createLeaguePortfolioImpl;
    private _createAssetImpl;
}
