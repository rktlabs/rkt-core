import { PortfolioOrderRepository, TPortfolioOrder, TPortfolioOrderFill, TPortfolioOrderComplete, TPortfolioOrderFailed } from '..';
export declare class PortfolioOrderEventService {
    private portfolioOrderRepository;
    constructor(portfolioOrderRepository: PortfolioOrderRepository);
    processFillEvent: (payload: TPortfolioOrderFill) => Promise<TPortfolioOrder | undefined>;
    processCompleteEvent: (payload: TPortfolioOrderComplete) => Promise<TPortfolioOrder | undefined>;
    processFailEvent: (payload: TPortfolioOrderFailed) => Promise<TPortfolioOrder | undefined>;
    private _close;
    private _updateStatus;
}
