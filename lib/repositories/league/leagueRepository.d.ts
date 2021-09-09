import { RepositoryBase } from '../repositoryBase';
import { TLeague, TLeagueUpdate } from '../../models/league';
export declare class LeagueRepository extends RepositoryBase {
    db: FirebaseFirestore.Firestore;
    constructor();
    filterMap: any;
    getListAsync(qs?: any): Promise<TLeague[]>;
    getDetailAsync(leagueId: string): Promise<TLeague | null>;
    storeAsync(entity: TLeague): Promise<void>;
    updateAsync(leagueId: string, entityData: TLeagueUpdate): Promise<void>;
    deleteAsync(leagueId: string): Promise<void>;
}
