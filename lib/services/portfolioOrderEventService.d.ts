import { PortfolioOrderRepository, TPortfolioOrder, TPortfolioOrderFill, TPortfolioOrderComplete, TPortfolioOrderFailed } from '..';
export declare class PortfolioOrderEventService {
    private portfolioOrderRepository;
    constructor(portfolioOrderRepository: PortfolioOrderRepository);
    processFillEvent: (payload: TPortfolioOrderFill) => Promise<TPortfolioOrder | undefined>;
    processComplete: (payload: TPortfolioOrderComplete) => Promise<TPortfolioOrder | undefined>;
    processFailEvent: (payload: TPortfolioOrderFailed) => Promise<TPortfolioOrder | undefined>;
    private close;
    private updateStatus;
}
