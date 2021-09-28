import { AssetRepository, LeagueRepository, PortfolioRepository, TNewLeagueConfig, League, TLeagueAssetDef, TAssetCore } from '..';
export declare class LeagueFactory {
    private assetRepository;
    private leagueRepository;
    private portfolioRepository;
    private portfolioService;
    private assetService;
    constructor(leagueRepository: LeagueRepository, assetRepository: AssetRepository, portfolioRepository: PortfolioRepository);
    createLeague(payload: TNewLeagueConfig): Promise<League>;
    deleteLeague(leagueId: string): Promise<void>;
    createAsset(leagueSpec: string | League, assetDef: TLeagueAssetDef): Promise<void>;
    attachAsset(leagueSpec: string | League, asset: TAssetCore): Promise<void>;
    detachAsset(leagueSpec: string | League, assetId: string): Promise<void>;
    private _createLeagueImpl;
    private _attachAssetToLeague;
    private _detachAssetFromLeague;
    private _createLeaguePortfolioImpl;
    private _createAssetImpl;
}
