import { AssetRepository, PortfolioRepository, TransactionRepository, MarketMakerRepository, OrderSide, TExchangeQuoteLast, TExchangeQuote, TMarketMaker, TExchangeOrder, TNewMarketMakerConfig } from '../../../..';
import { MarketMakerServiceBase, TMakerResult } from '../../marketMakerServiceBase';
export declare type KMakerAMMSettings = {
    initialUnits?: number;
    initialValue?: number;
    initialPrice?: number;
    initialPoolUnits: number;
    initialPoolCoins: number;
};
export declare type KMakerParams = {
    madeUnits: number;
    cumulativeValue: number;
    x0: number;
    poolUnits: number;
    poolCoins: number;
};
export declare class KMaker extends MarketMakerServiceBase {
    protected assetRepository: AssetRepository;
    protected portfolioRepository: PortfolioRepository;
    protected transactionRepository: TransactionRepository;
    protected marketMakerRepository: MarketMakerRepository;
    private assetHolderRepository;
    private mintService;
    static newMaker(assetRepository: AssetRepository, portfolioRepository: PortfolioRepository, transactionRepository: TransactionRepository, marketMakerRepository: MarketMakerRepository, config: TNewMarketMakerConfig): KMaker;
    constructor(assetRepository: AssetRepository, portfolioRepository: PortfolioRepository, transactionRepository: TransactionRepository, marketMakerRepository: MarketMakerRepository, props: TMarketMaker);
    processOrder(order: TExchangeOrder): Promise<boolean>;
    processOrderImpl(assetPortfolioId: string, orderSide: OrderSide, orderSize: number): Promise<TMakerResult | null>;
    private processOrderSize;
    private computePropsUpdate;
    getQuote(last?: TExchangeQuoteLast): TExchangeQuote;
    spotPrice(): number;
    computePrice(units?: number): number;
    computeValue(units?: number): number;
    private _currentPriceFunction;
    private _totalValueFunction;
    private _deltaValueFunction;
    private computeInitialState;
}
