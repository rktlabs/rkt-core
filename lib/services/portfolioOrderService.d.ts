import { PortfolioOrderRepository, AssetRepository, PortfolioRepository, TransactionRepository, MarketMakerRepository, PortfolioOrder, TOrderSource } from '..';
export declare class PortfolioOrderService {
    private portfolioOrderRepository;
    private assetRepository;
    private portfolioRepository;
    private portfolioOrderEventService;
    private exchangeService;
    constructor(assetRepository: AssetRepository, portfolioRepository: PortfolioRepository, transactionRepository: TransactionRepository, marketMakerRepository: MarketMakerRepository, portfolioOrderRepository: PortfolioOrderRepository);
    submitNewPortfolioOrderAsync(portfolioId: string, orderPayload: TOrderSource): Promise<PortfolioOrder>;
    private _onOrderExecution;
    private _onOrderFail;
}
