import { PortfolioRepository } from '../repositories/portfolioRepository'

export class PortfolioQuery {
    portfolioRepository: PortfolioRepository

    constructor() {
        this.portfolioRepository = new PortfolioRepository()
    }

    async getListAsync(qs?: any) {
        return {
            data: await this.portfolioRepository.listPortfolios(qs),
        }
    }

    async getDetailAsync(id: string) {
        const portfolioDetail = await this.portfolioRepository.getPortfolio(id)
        return portfolioDetail
    }
}
