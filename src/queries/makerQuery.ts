import { MarketMakerRepository } from '../repositories/marketMaker/marketMakerRepository'

export class MakerQuery {
    marketMakerRepository: MarketMakerRepository

    constructor() {
        this.marketMakerRepository = new MarketMakerRepository()
    }

    async getListAsync(qs?: any) {
        return {
            data: await this.marketMakerRepository.getListAsync(qs),
        }
    }

    async getDetailAsync(id: string) {
        const makerDetail = await this.marketMakerRepository.getDetailAsync(id)
        return makerDetail
    }
}
