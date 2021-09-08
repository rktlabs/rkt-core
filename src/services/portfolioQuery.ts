import { PortfolioRepository } from '../repositories/portfolioRepository'

export class PortfolioQuery {
    portfolioRepository: PortfolioRepository

    constructor() {
        this.portfolioRepository = new PortfolioRepository()
    }

    async getListAsync(qs?: any) {
        return {
            data: await this.portfolioRepository.getListAsync(qs),
        }
    }

    async getDetailAsync(id: string) {
        const portfolioDetail = await this.portfolioRepository.getDetailAsync(id)
        return portfolioDetail
    }

    async getPortfolioHoldingsAsync(qs?: any) {
        return {
            data: await this.portfolioRepository.getListAsync(qs),
        }
    }

    async getPortfolioActivityAsync(qs?: any) {
        return {
            data: await this.portfolioRepository.getListAsync(qs),
        }
    }
}
