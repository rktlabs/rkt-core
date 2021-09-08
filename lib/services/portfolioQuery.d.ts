import { PortfolioActivityRepository, PortfolioHoldingsRepository } from '..';
import { PortfolioRepository } from '../repositories/portfolioRepository';
export declare class PortfolioQuery {
    portfolioRepository: PortfolioRepository;
    portfolioActivityRepository: PortfolioActivityRepository;
    portfolioHoldingsRepository: PortfolioHoldingsRepository;
    constructor();
    getListAsync(qs?: any): Promise<{
        data: import("..").TPortfolio[];
    }>;
    getDetailAsync(id: string): Promise<import("..").TPortfolio | null>;
    getPortfolioHoldingsAsync(portfolioId: string, qs?: any): Promise<{
        data: import("..").TPortfolioHolding[];
    }>;
    getPortfolioActivityAsync(portfolioId: string, qs?: any): Promise<{
        data: import("..").TTransaction[];
    }>;
}
