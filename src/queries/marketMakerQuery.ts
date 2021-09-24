'use strict'

import { MarketMakerRepository } from '../repositories/marketMaker/marketMakerRepository'

export class MarketMakerQuery {
    marketMakerRepository: MarketMakerRepository

    constructor(marketMakerRepository: MarketMakerRepository) {
        this.marketMakerRepository = marketMakerRepository
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
