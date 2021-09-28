import { MarketMakerBase, TMarketMaker, TMakerResult } from '../..';
import { AssetRepository, PortfolioRepository, TransactionRepository, MarketMakerRepository, TNewExchangeOrderConfig, OrderSide, TExchangeQuoteLast, TExchangeQuote } from '../../../..';
export declare type BondingCurveAMMSettings = {
    initialUnits?: number;
    initialValue?: number;
    initialPrice?: number;
};
export declare type BondingCurveAMMParams = {
    madeUnits: number;
    cumulativeValue: number;
    y0: number;
    e: number;
    m: number;
};
export declare class BondingCurveAMM extends MarketMakerBase {
    protected assetRepository: AssetRepository;
    protected portfolioRepository: PortfolioRepository;
    protected transactionRepository: TransactionRepository;
    protected marketMakerRepository: MarketMakerRepository;
    private assetHolderRepository;
    private mintService;
    constructor(assetRepository: AssetRepository, portfolioRepository: PortfolioRepository, transactionRepository: TransactionRepository, marketMakerRepository: MarketMakerRepository, props: TMarketMaker);
    processOrder(order: TNewExchangeOrderConfig): Promise<boolean>;
    processOrderImpl(assetPortfolioId: string, orderSide: OrderSide, orderSize: number): Promise<TMakerResult | null>;
    processOrderSize(signedTakerOrderSize: number): TMakerResult;
    getQuote(last?: TExchangeQuoteLast): TExchangeQuote;
    spotPrice(): number;
    computePrice(units?: number): number;
    computeValue(units?: number): number;
    private _currentPriceFunction;
    private _totalValueFunction;
    private _deltaValueFunction;
}
