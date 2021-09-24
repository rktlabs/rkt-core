import { MarketMakerBase, TMakerResult, TMarketMaker, TNewMarketMakerConfig } from '../..';
import { AssetRepository, PortfolioRepository, TransactionRepository } from '../../../..';
export declare class BondingCurveAMM extends MarketMakerBase {
    private assetHolderRepository;
    private mintService;
    static newMaker(assetRepository: AssetRepository, portfolioRepository: PortfolioRepository, transactionRepository: TransactionRepository, props: TNewMarketMakerConfig): BondingCurveAMM;
    private computeInitialState;
    constructor(assetRepository: AssetRepository, portfolioRepository: PortfolioRepository, transactionRepository: TransactionRepository, props: TMarketMaker);
    processOrderImpl(orderSide: string, orderSize: number): Promise<TMakerResult | null>;
    processAMMOrderImpl(signedTakerOrderSize: number): TMakerResult;
    spot_price(): number;
    compute_price(units?: number): number;
    compute_value(units?: number): number;
    private __current_price_function;
    private __total_value_function;
    private __delta_value_function;
}
