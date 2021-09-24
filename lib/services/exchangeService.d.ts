import { TNewExchangeOrderConfig, ExchangeOrder, PortfolioRepository, INotificationPublisher, AssetRepository } from '..';
export declare class ExchangeService {
    private orderNotificationPublisher;
    private portfolioRepository;
    private assetHolderRepository;
    private assetRepository;
    private exchangeOrderRepository;
    private exchangeTradeRepository;
    private exchangeQuoteRepository;
    private transactionService;
    private marketMakerService;
    constructor(assetRepository: AssetRepository, portfolioRepository: PortfolioRepository, eventPublisher?: INotificationPublisher);
    processNewExchangeOrderAsync(orderPayload: TNewExchangeOrderConfig): Promise<ExchangeOrder | undefined>;
    private onFill;
    private onTrade;
    private onUpdateQuote;
    private process_transaction;
    private verifyAssetsAsync;
    private verifyFundsAsync;
}
