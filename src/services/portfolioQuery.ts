import { PortfolioActivityRepository, PortfolioHoldingsRepository } from '..'
import { PortfolioRepository } from '../repositories/portfolioRepository'

export class PortfolioQuery {
    portfolioRepository: PortfolioRepository
    portfolioActivityRepository: PortfolioActivityRepository
    portfolioHoldingsRepository: PortfolioHoldingsRepository

    constructor() {
        this.portfolioRepository = new PortfolioRepository()
        this.portfolioActivityRepository = new PortfolioActivityRepository()
        this.portfolioHoldingsRepository = new PortfolioHoldingsRepository()
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
            data: await this.portfolioHoldingsRepository.listPortfolioHoldings(qs),
        }
    }

    async getPortfolioActivityAsync(qs?: any) {
        return {
            data: await this.portfolioActivityRepository.listPortfolioActivity(qs),
        }
    }
}
