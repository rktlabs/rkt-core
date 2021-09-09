import { LeagueRepository } from '../repositories/leagueRepository';
export declare class LeagueQuery {
    leagueRepository: LeagueRepository;
    constructor();
    getListAsync(qs?: any): Promise<{
        data: import("..").TLeague[];
    }>;
    getDetailAsync(id: string): Promise<import("..").TLeague | null>;
}
