import { TNewExchangeOrder, ExchangeOrder, IEventPublisher } from '../..';
export declare class ExchangeService {
    private orderEventPublisher;
    private portfolioRepository;
    private assetHolderRepository;
    private exchangeOrderRepository;
    private exchangeTradeRepository;
    private exchangeQuoteRepository;
    private transactionService;
    private makerFactoryService;
    constructor(eventPublisher?: IEventPublisher);
    handleNewExchangeOrderAsync(orderPayload: TNewExchangeOrder): Promise<ExchangeOrder>;
    private onFill;
    private onTrade;
    private xact;
    private verifyAssetsAsync;
    private verifyFundsAsync;
}
