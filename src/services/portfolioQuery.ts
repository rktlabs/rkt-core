import {
    PortfolioRepository,
    PortfolioActivityRepository,
    PortfolioHoldingsRepository,
    PortfolioOrdersRepository,
} from '..'

export class PortfolioQuery {
    portfolioRepository: PortfolioRepository
    portfolioActivityRepository: PortfolioActivityRepository
    portfolioHoldingsRepository: PortfolioHoldingsRepository
    portfolioOrdersRepository: PortfolioOrdersRepository

    constructor() {
        this.portfolioRepository = new PortfolioRepository()
        this.portfolioActivityRepository = new PortfolioActivityRepository()
        this.portfolioHoldingsRepository = new PortfolioHoldingsRepository()
        this.portfolioOrdersRepository = new PortfolioOrdersRepository()
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

    async getPortfolioOrdersAsync(portfolioId: string, qs?: any) {
        return {
            data: await this.portfolioOrdersRepository.getListAsync(portfolioId, qs),
        }
    }
}
