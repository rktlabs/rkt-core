import { PortfolioOrderRepository, AssetRepository, PortfolioRepository, TransactionRepository, MarketMakerRepository, TNewPortfolioOrderProps, PortfolioOrder } from '..';
export declare class PortfolioOrderService {
    private portfolioOrderRepository;
    private assetRepository;
    private portfolioRepository;
    private portfolioOrderEventService;
    private exchangeService;
    constructor(assetRepository: AssetRepository, portfolioRepository: PortfolioRepository, transactionRepository: TransactionRepository, marketMakerRepository: MarketMakerRepository, portfolioOrderRepository: PortfolioOrderRepository);
    submitNewPortfolioOrderAsync(portfolioId: string, orderPayload: TNewPortfolioOrderProps): Promise<PortfolioOrder>;
    private _onOrderExecution;
    private _onOrderFail;
    private _generateExchangeOrder;
}
