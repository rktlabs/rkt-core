import { MarketMakerBase, OrderSide, TMakerResult, TMarketMaker, TNewMarketMakerConfig } from '../..';
import { AssetRepository, MarketMakerRepository, PortfolioRepository, TransactionRepository } from '../../../..';
export declare class BondingCurveAMM extends MarketMakerBase {
    private assetHolderRepository;
    private mintService;
    static newMaker(assetRepository: AssetRepository, portfolioRepository: PortfolioRepository, transactionRepository: TransactionRepository, marketMakerRepository: MarketMakerRepository, props: TNewMarketMakerConfig): BondingCurveAMM;
    private computeInitialState;
    constructor(assetRepository: AssetRepository, portfolioRepository: PortfolioRepository, transactionRepository: TransactionRepository, marketMakerRepository: MarketMakerRepository, props: TMarketMaker);
    processOrderImpl(orderSide: OrderSide, orderSize: number): Promise<TMakerResult | null>;
    processAMMOrderImpl(signedTakerOrderSize: number): TMakerResult;
    spot_price(): number;
    compute_price(units?: number): number;
    compute_value(units?: number): number;
    private _currentPriceFunction;
    private _totalValueFunction;
    private _deltaValueFunction;
}
