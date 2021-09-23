import { PortfolioRepository, PortfolioActivityRepository, PortfolioHoldingRepository, PortfolioOrderRepository } from '..';
export declare class PortfolioQuery {
    portfolioRepository: PortfolioRepository;
    portfolioActivityRepository: PortfolioActivityRepository;
    portfolioHoldingRepository: PortfolioHoldingRepository;
    portfolioOrderRepository: PortfolioOrderRepository;
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
        data: import("..").TPortfolioOrder[];
    }>;
    getPortfolioOrderDetailAsync(portfolioId: string, orderId: string): Promise<{
        data: import("..").TPortfolioOrder | null;
    }>;
}
