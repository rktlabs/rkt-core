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
    private createLeagueImpl;
    private createLeaguePortfolioImpl;
    private newAssetImpl;
    private addAssetToLeague;
}
