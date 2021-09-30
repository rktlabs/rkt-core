import { MarketMakerRepository, PortfolioRepository, TransactionRepository, AssetRepository, TNewExchangeOrderConfig, TNewMarketMakerConfig } from '..';
import { IMarketMakerService, MarketMakerServiceBase } from '../services/marketMakerService/marketMakerServiceBase';
export declare class MarketMakerFactory {
    private marketMakerRepository;
    private portfolioRepository;
    private transactionRepository;
    private portfolioFactory;
    private assetRepository;
    private exchangeQuoteRepository;
    constructor(assetRepository: AssetRepository, portfolioRepository: PortfolioRepository, transactionRepository: TransactionRepository, marketMakerRepository: MarketMakerRepository);
    getMarketMakerAsync(assetId: string): Promise<IMarketMakerService | null>;
    createMarketMaker(payload: TNewMarketMakerConfig, shouldCreatePortfolio?: boolean): Promise<MarketMakerServiceBase>;
    deleteMaker(assetId: string): Promise<void>;
    static generateOrder(opts: TNewExchangeOrderConfig): TNewExchangeOrderConfig;
    private _createMarketMakerImpl;
    private _createMarketMakerPortfolioImpl;
}
