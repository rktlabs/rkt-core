import { AssetRepository, PortfolioRepository, TransactionRepository, MarketMakerRepository, TNewPortfolioOrderProps, PortfolioOrder, TPortfolioOrder } from '..';
export declare class PortfolioOrderService {
    private portfolioOrderRepository;
    private assetRepository;
    private portfolioRepository;
    private exchangeService;
    constructor(assetRepository: AssetRepository, portfolioRepository: PortfolioRepository, transactionRepository: TransactionRepository, marketMakerRepository: MarketMakerRepository);
    submitNewPortfolioOrderAsync(portfolioId: string, orderPayload: TNewPortfolioOrderProps): Promise<PortfolioOrder>;
    unwindOrder(portfolioId: string, orderId: string): Promise<PortfolioOrder>;
    cancelOrder(portfolioId: string, orderId: string): Promise<TPortfolioOrder | null>;
    private _generateExchangeOrder;
    private _generateCancelExchangeOrder;
}
