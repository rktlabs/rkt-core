import { TNewExchangeOrderConfig, ExchangeOrder, IEventPublisher } from '../..';
export declare class ExchangeService {
    private orderEventPublisher;
    private portfolioRepository;
    private assetHolderRepository;
    private exchangeOrderRepository;
    private exchangeTradeRepository;
    private exchangeQuoteRepository;
    private transactionService;
    private makerService;
    constructor(eventPublisher?: IEventPublisher);
    processNewExchangeOrderAsync(orderPayload: TNewExchangeOrderConfig): Promise<ExchangeOrder>;
    private onFill;
    private onTrade;
    private process_transaction;
    private verifyAssetsAsync;
    private verifyFundsAsync;
}
