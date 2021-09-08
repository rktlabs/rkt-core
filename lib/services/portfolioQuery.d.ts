import { PortfolioRepository } from '../repositories/portfolioRepository';
export declare class PortfolioQuery {
    portfolioRepository: PortfolioRepository;
    constructor();
    getListAsync(qs?: any): Promise<{
        data: import("..").TPortfolio[];
    }>;
    getDetailAsync(id: string): Promise<import("..").TPortfolio | null>;
    getPortfolioHoldingsAsync(qs?: any): Promise<{
        data: import("..").TPortfolio[];
    }>;
    getPortfolioActivityAsync(qs?: any): Promise<{
        data: import("..").TPortfolio[];
    }>;
}
