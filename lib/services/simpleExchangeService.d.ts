import { AssetRepository, INotificationPublisher, MarketMakerRepository, PortfolioRepository, TransactionRepository, UserRepository } from '..';
export declare class SimpleExchangeService {
    private userRepository;
    private assetRepository;
    private portfolioRepository;
    private assetHolderRepository;
    private transactionService;
    private marketMakerService;
    constructor(assetRepository: AssetRepository, portfolioRepository: PortfolioRepository, transactionRepository: TransactionRepository, userRepository: UserRepository, marketMakerRepository: MarketMakerRepository, eventPublisher?: INotificationPublisher);
    buy(userId: string, assetId: string, orderSize: number): Promise<void>;
    sell(userId: string, assetId: string, orderSize: number): Promise<void>;
    user_transact(userId: string, assetId: string, orderSide: string, orderSize: number): Promise<void>;
    portfolio_transact(portfolioId: string, assetId: string, orderSide: string, orderSize: number): Promise<void>;
    private process_transaction;
    private verifyAssetsAsync;
    private verifyFundsAsync;
}
