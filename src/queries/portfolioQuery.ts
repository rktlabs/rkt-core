import {
    PortfolioRepository,
    PortfolioActivityRepository,
    PortfolioHoldingRepository,
    PortfolioOrderRepository,
} from '..'

export class PortfolioQuery {
    portfolioRepository: PortfolioRepository
    portfolioActivityRepository: PortfolioActivityRepository
    portfolioHoldingRepository: PortfolioHoldingRepository
    portfolioOrderRepository: PortfolioOrderRepository

    constructor(portfolioRepository: PortfolioRepository) {
        this.portfolioRepository = portfolioRepository
        this.portfolioActivityRepository = new PortfolioActivityRepository()
        this.portfolioHoldingRepository = new PortfolioHoldingRepository()
        this.portfolioOrderRepository = new PortfolioOrderRepository()
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
            data: await this.portfolioHoldingRepository.getListAsync(portfolioId, qs),
        }
    }

    async getPortfolioHoldingDetailAsync(portfolioId: string, orderId: string) {
        return {
            data: await this.portfolioHoldingRepository.getDetailAsync(portfolioId, orderId),
        }
    }

    async getPortfolioActivityAsync(portfolioId: string, qs?: any) {
        return {
            data: await this.portfolioActivityRepository.getListAsync(portfolioId, qs),
        }
    }

    async getPortfolioOrdersAsync(portfolioId: string, qs?: any) {
        return {
            data: await this.portfolioOrderRepository.getListAsync(portfolioId, qs),
        }
    }

    async getPortfolioOrderDetailAsync(portfolioId: string, orderId: string) {
        return {
            data: await this.portfolioOrderRepository.getDetailAsync(portfolioId, orderId),
        }
    }
}
