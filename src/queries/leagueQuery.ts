import { LeagueRepository } from '../repositories/league/leagueRepository'

export class LeagueQuery {
    leagueRepository: LeagueRepository

    constructor(leagueRepository: LeagueRepository) {
        this.leagueRepository = leagueRepository
    }

    async getListAsync(qs?: any) {
        return {
            data: await this.leagueRepository.getListAsync(qs),
        }
    }

    async getDetailAsync(id: string) {
        const leagueDetail = await this.leagueRepository.getDetailAsync(id)
        return leagueDetail
    }
}
