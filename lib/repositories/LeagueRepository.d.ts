import { TLeague, TLeagueUpdate } from '../models/league';
import { RepositoryBase } from './repositoryBase';
export declare class LeagueRepository extends RepositoryBase {
    db: FirebaseFirestore.Firestore;
    constructor();
    getListAsync(qs?: any): Promise<TLeague[]>;
    getDetailAsync(leagueId: string): Promise<TLeague | null>;
    storeAsync(entity: TLeague): Promise<void>;
    updateAsync(leagueId: string, entityData: TLeagueUpdate): Promise<void>;
    deleteAsync(leagueId: string): Promise<void>;
}
