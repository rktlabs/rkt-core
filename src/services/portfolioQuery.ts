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

    async getPortfolioHoldingsAsync(portfolioId: string, qs?: any) {
        return {
            data: await this.portfolioHoldingsRepository.getListAsync(portfolioId, qs),
        }
    }

    async getPortfolioActivityAsync(portfolioId: string, qs?: any) {
        return {
            data: await this.portfolioActivityRepository.getListAsync(portfolioId, qs),
        }
    }
}
