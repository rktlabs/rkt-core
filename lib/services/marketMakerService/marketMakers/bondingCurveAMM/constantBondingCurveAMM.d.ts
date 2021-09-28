import { TNewMarketMakerConfig, TMarketMaker } from '../..';
import { AssetRepository, PortfolioRepository, TransactionRepository, MarketMakerRepository } from '../../../..';
import { BondingCurveAMM } from './bondingCurveAMM';
export declare class ConstantBondingCurveAMM extends BondingCurveAMM {
    static newMaker(assetRepository: AssetRepository, portfolioRepository: PortfolioRepository, transactionRepository: TransactionRepository, marketMakerRepository: MarketMakerRepository, config: TNewMarketMakerConfig): ConstantBondingCurveAMM;
    constructor(assetRepository: AssetRepository, portfolioRepository: PortfolioRepository, transactionRepository: TransactionRepository, marketMakerRepository: MarketMakerRepository, props: TMarketMaker);
    private computeInitialState;
}
