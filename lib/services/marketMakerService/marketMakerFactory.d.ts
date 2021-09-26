import { IMarketMaker, MarketMakerBase, TNewMarketMakerConfig, TOrder, TOrderConfig } from '.';
import { AssetRepository, MarketMakerRepository, PortfolioRepository, TransactionRepository } from '../..';
export declare class MarketMakerFactory {
    private marketMakerRepository;
    private portfolioRepository;
    private transactionRepository;
    private portfolioService;
    private assetRepository;
    constructor(assetRepository: AssetRepository, portfolioRepository: PortfolioRepository, transactionRepository: TransactionRepository, marketMakerRepository: MarketMakerRepository);
    getMarketMakerAsync(assetId: string): Promise<IMarketMaker | null>;
    createMarketMaker(payload: TNewMarketMakerConfig, shouldCreatePortfolio?: boolean): Promise<MarketMakerBase>;
    deleteMaker(assetId: string): Promise<void>;
    scrubMarketMaker(assetId: string): Promise<void>;
    static generateOrder(opts: TOrderConfig): TOrder;
    private _createMarketMakerImpl;
    private _createMarketMakerPortfolioImpl;
}