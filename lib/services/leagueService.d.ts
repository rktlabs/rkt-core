import { TNewLeague, League, TLeagueAssetDef } from '..';
export declare class LeagueService {
    private assetRepository;
    private leagueRepository;
    private portfolioRepository;
    private portfolioService;
    private assetService;
    constructor();
    newLeague(payload: TNewLeague): Promise<League>;
    deleteLeague(leagueId: string): Promise<void>;
    scrubLeague(leagueId: string): Promise<void>;
    scrubLeagueAsset(assetId: string): Promise<any[]>;
    newAsset(leagueSpec: string | League, assetDef: TLeagueAssetDef): Promise<void>;
    dropAsset(leagueSpec: string | League, assetId: string): Promise<void>;
    private createLeagueImpl;
    private addAssetToLeague;
    private dropAssetFromLeague;
    private createLeaguePortfolioImpl;
    private newAssetImpl;
}
