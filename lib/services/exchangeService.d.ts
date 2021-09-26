import { AssetRepository, ExchangeOrder, INotificationPublisher, MarketMakerRepository, PortfolioOrderRepository, PortfolioRepository, TNewExchangeOrderConfig, TransactionRepository } from '..';
export declare class ExchangeService {
    private orderNotificationPublisher;
    private portfolioRepository;
    private assetHolderRepository;
    private exchangeOrderRepository;
    private exchangeTradeRepository;
    private exchangeQuoteRepository;
    private transactionService;
    private marketMakerService;
    private portfolioOrderEventService;
    constructor(assetRepository: AssetRepository, portfolioRepository: PortfolioRepository, transactionRepository: TransactionRepository, marketMakerRepository: MarketMakerRepository, portfolioOrderRepository: PortfolioOrderRepository, eventPublisher?: INotificationPublisher);
    processNewExchangeOrderEvent(orderPayload: TNewExchangeOrderConfig): Promise<ExchangeOrder | undefined>;
    private _updateExchangeOrder;
    private _onFill;
    private _onTrade;
    private _onUpdateQuote;
    private _processTransaction;
    private _verifyAssetsAsync;
    private _verifyFundsAsync;
}
