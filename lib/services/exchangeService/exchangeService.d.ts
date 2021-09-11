import { TNewExchangeOrder, ExchangeOrder, EventPublisher } from '../..';
export declare class ExchangeService {
    private eventPublisher;
    private assetRepository;
    private leagueRepository;
    private portfolioHoldingsCache;
    private portfolioCache;
    private exchangeOrderRepository;
    private exchangeTradeRepository;
    private transactionService;
    private makerService;
    constructor(eventPublisher?: EventPublisher);
    handleNewExchangeOrderAsync(orderPayload: TNewExchangeOrder): Promise<ExchangeOrder | null>;
    private processOrder;
    private onFill;
    private onTrade;
    private onUpdateQuote;
    private xact;
    private verifyAssetsAsync;
    private verifyFundsAsync;
}
