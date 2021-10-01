import { PortfolioRepository, ActivityRepository, PortfolioHoldingRepository, PortfolioOrderRepository } from '..';
export declare class PortfolioQuery {
    portfolioRepository: PortfolioRepository;
    activityRepository: ActivityRepository;
    portfolioHoldingRepository: PortfolioHoldingRepository;
    portfolioOrderRepository: PortfolioOrderRepository;
    constructor(portfolioRepository: PortfolioRepository, portfolioOrderRepository: PortfolioOrderRepository);
    getListAsync(qs?: any): Promise<{
        data: import("..").TPortfolio[];
    }>;
    getDetailAsync(id: string): Promise<any>;
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
