import { PortfolioRepository, INotificationPublisher, AssetRepository } from '..';
export declare class SimpleExchangeService {
    private userRepository;
    private assetRepository;
    private portfolioRepository;
    private assetHolderRepository;
    private exchangeQuoteRepository;
    private transactionService;
    private marketMakerService;
    constructor(assetRepository: AssetRepository, portfolioRepository: PortfolioRepository, eventPublisher?: INotificationPublisher);
    buy(userId: string, assetId: string, orderSize: number): Promise<void>;
    sell(userId: string, assetId: string, orderSize: number): Promise<void>;
    user_transact(userId: string, assetId: string, orderSide: string, orderSize: number): Promise<void>;
    portfolio_transact(portfolioId: string, assetId: string, orderSide: string, orderSize: number): Promise<void>;
    private process_transaction;
    private verifyAssetsAsync;
    private verifyFundsAsync;
}
