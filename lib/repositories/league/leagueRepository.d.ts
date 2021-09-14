import { RepositoryBase } from '../repositoryBase';
import { TLeague, TLeagueUpdate } from '../../models/league';
import { TAssetCore } from '../..';
export declare class LeagueRepository extends RepositoryBase {
    db: FirebaseFirestore.Firestore;
    constructor();
    filterMap: any;
    getListAsync(qs?: any): Promise<TLeague[]>;
    getDetailAsync(leagueId: string): Promise<TLeague | null>;
    storeAsync(entity: TLeague): Promise<void>;
    updateAsync(leagueId: string, entityData: TLeagueUpdate): Promise<void>;
    deleteAsync(leagueId: string): Promise<void>;
    isPortfolioUsed(portfolioId: string): Promise<string | null>;
    dropLeagueAsset(leagueId: string, assetId: string): Promise<void>;
    addLeagueAsset(leagueId: string, asset: TAssetCore): Promise<void>;
}
