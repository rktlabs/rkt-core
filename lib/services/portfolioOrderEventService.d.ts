import { PortfolioOrderRepository, TPortfolioOrder, TExchangeOrderFill, TExchangeOrderComplete, TExchangeOrder } from '..';
export declare class PortfolioOrderEventService {
    private portfolioOrderRepository;
    constructor(portfolioOrderRepository: PortfolioOrderRepository);
    processFillEvent: (payload: TExchangeOrderFill) => Promise<TPortfolioOrder | undefined>;
    processCompleteEvent: (payload: TExchangeOrderComplete) => Promise<TPortfolioOrder | undefined>;
    processFailEvent: (order: TExchangeOrder) => Promise<TPortfolioOrder | undefined>;
    private _close;
    private _updateStatus;
}
