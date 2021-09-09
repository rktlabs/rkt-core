import { LeagueRepository } from '../repositories/leagueRepository'

export class LeagueQuery {
    leagueRepository: LeagueRepository

    constructor() {
        this.leagueRepository = new LeagueRepository()
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