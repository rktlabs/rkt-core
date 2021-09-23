import { TNewExchangeOrderConfig, ExchangeOrder, INotificationPublisher } from '..';
export declare class ExchangeService {
    private orderNotificationPublisher;
    private portfolioRepository;
    private assetHolderRepository;
    private exchangeOrderRepository;
    private exchangeTradeRepository;
    private exchangeQuoteRepository;
    private transactionService;
    private marketMakerService;
    constructor(eventPublisher?: INotificationPublisher);
    processNewExchangeOrderAsync(orderPayload: TNewExchangeOrderConfig): Promise<ExchangeOrder>;
    private onFill;
    private onTrade;
    private process_transaction;
    private verifyAssetsAsync;
    private verifyFundsAsync;
}
