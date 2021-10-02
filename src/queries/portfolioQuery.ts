'use strict'

import { PortfolioRepository, ActivityRepository, PortfolioHoldingRepository, PortfolioOrderRepository } from '..'

export class PortfolioQuery {
    portfolioRepository: PortfolioRepository
    activityRepository: ActivityRepository
    portfolioHoldingRepository: PortfolioHoldingRepository
    portfolioOrderRepository: PortfolioOrderRepository

    constructor(portfolioRepository: PortfolioRepository, portfolioOrderRepository: PortfolioOrderRepository) {
        this.portfolioRepository = portfolioRepository
        this.activityRepository = new ActivityRepository()
        this.portfolioHoldingRepository = new PortfolioHoldingRepository()
        this.portfolioOrderRepository = portfolioOrderRepository
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

    async getPortfolioHoldingDetailAsync(portfolioId: string, assetId: string) {
        return {
            data: await this.portfolioHoldingRepository.getDetailAsync(portfolioId, assetId),
        }
    }

    async getPortfolioActivityAsync(portfolioId: string, qs?: any) {
        return {
            data: await this.activityRepository.getPortfolioListAsync(portfolioId, qs),
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
