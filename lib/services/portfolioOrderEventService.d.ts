import { PortfolioOrderRepository, TPortfolioOrder, TExchangeOrderFill, TExchangeOrderFailed, TExchangeOrderComplete } from '..';
export declare class PortfolioOrderEventService {
    private portfolioOrderRepository;
    constructor(portfolioOrderRepository: PortfolioOrderRepository);
    processFillEvent: (payload: TExchangeOrderFill) => Promise<TPortfolioOrder | undefined>;
    processCompleteEvent: (payload: TExchangeOrderComplete) => Promise<TPortfolioOrder | undefined>;
    processFailEvent: (payload: TExchangeOrderFailed) => Promise<TPortfolioOrder | undefined>;
    private _close;
    private _updateStatus;
}
