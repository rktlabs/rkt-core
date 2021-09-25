import { AssetRepository, ExchangeOrder, INotificationPublisher, MarketMakerRepository, PortfolioOrderRepository, PortfolioRepository, TExchangeOrderPatch, TNewExchangeOrderConfig, TransactionRepository } from '..';
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
    submitNewExchangeOrderAsync(orderPayload: TNewExchangeOrderConfig): Promise<ExchangeOrder | undefined>;
    processFillEvent: (portfolioId: string, orderId: string, payload: TExchangeOrderPatch) => Promise<import("..").TExchangeOrder | undefined>;
    private onFill;
    private onTrade;
    private onUpdateQuote;
    private processTransaction;
    private verifyAssetsAsync;
    private verifyFundsAsync;
}
