import { PortfolioRepository, PortfolioActivityRepository, PortfolioHoldingsRepository, PortfolioOrdersRepository } from '..';
export declare class PortfolioQuery {
    portfolioRepository: PortfolioRepository;
    portfolioActivityRepository: PortfolioActivityRepository;
    portfolioHoldingsRepository: PortfolioHoldingsRepository;
    portfolioOrdersRepository: PortfolioOrdersRepository;
    constructor();
    getListAsync(qs?: any): Promise<{
        data: import("..").TPortfolio[];
    }>;
    getDetailAsync(id: string): Promise<import("..").TPortfolio | null>;
    getPortfolioHoldingsAsync(portfolioId: string, qs?: any): Promise<{
        data: import("..").TPortfolioHolding[];
    }>;
    getPortfolioHoldingDetailAsync(portfolioId: string, orderId: string): Promise<{
        data: import("..").TPortfolioHolding | null;
    }>;
    getPortfolioActivityAsync(portfolioId: string, qs?: any): Promise<{
        data: import("..").TTransaction[];
    }>;
    getPortfolioOrdersAsync(portfolioId: string, qs?: any): Promise<{
        data: import("..").TOrder[];
    }>;
    getPortfolioOrderDetailAsync(portfolioId: string, orderId: string): Promise<{
        data: import("..").TOrder | null;
    }>;
}