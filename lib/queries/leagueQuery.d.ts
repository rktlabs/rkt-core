import { LeagueRepository } from '../repositories/league/leagueRepository';
export declare class LeagueQuery {
    leagueRepository: LeagueRepository;
    constructor(leagueRepository: LeagueRepository);
    getListAsync(qs?: any): Promise<{
        data: import("..").TLeague[];
    }>;
    getDetailAsync(id: string): Promise<import("..").TLeague | null>;
}
