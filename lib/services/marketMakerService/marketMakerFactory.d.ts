import { IMarketMaker, TNewMarketMakerConfig, MarketMakerBase } from '.';
import { MarketMakerRepository, PortfolioRepository, TransactionRepository, AssetRepository, TNewExchangeOrderConfig } from '../..';
export declare class MarketMakerFactory {
    private marketMakerRepository;
    private portfolioRepository;
    private transactionRepository;
    private portfolioFactory;
    private assetRepository;
    private exchangeQuoteRepository;
    constructor(assetRepository: AssetRepository, portfolioRepository: PortfolioRepository, transactionRepository: TransactionRepository, marketMakerRepository: MarketMakerRepository);
    getMarketMakerAsync(assetId: string): Promise<IMarketMaker | null>;
    createMarketMaker(payload: TNewMarketMakerConfig, shouldCreatePortfolio?: boolean): Promise<MarketMakerBase>;
    deleteMaker(assetId: string): Promise<void>;
    static generateOrder(opts: TNewExchangeOrderConfig): TNewExchangeOrderConfig;
    private _createMarketMakerImpl;
    private _createMarketMakerPortfolioImpl;
}
