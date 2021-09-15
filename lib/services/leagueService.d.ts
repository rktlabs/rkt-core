import { TNewLeagueConfig, League, TLeagueAssetDef, TAssetCore } from '..';
export declare class LeagueService {
    private assetRepository;
    private leagueRepository;
    private portfolioRepository;
    private portfolioService;
    private assetService;
    constructor();
    createLeague(payload: TNewLeagueConfig): Promise<League>;
    deleteLeague(leagueId: string): Promise<void>;
    scrubLeague(leagueId: string): Promise<void>;
    scrubLeagueAsset(leagueId: string, assetId: string): Promise<any[]>;
    createAsset(leagueSpec: string | League, assetDef: TLeagueAssetDef): Promise<void>;
    addAsset(leagueSpec: string | League, asset: TAssetCore): Promise<void>;
    dropAsset(leagueSpec: string | League, assetId: string): Promise<void>;
    private createLeagueImpl;
    private addAssetToLeague;
    private dropAssetFromLeague;
    private createLeaguePortfolioImpl;
    private createAssetImpl;
}
