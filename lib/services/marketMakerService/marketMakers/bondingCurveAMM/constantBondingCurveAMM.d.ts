import { BondingCurveAMM } from './bondingCurveAMM';
import { TNewMarketMakerConfig, TMarketMaker } from '../..';
import { AssetRepository, PortfolioRepository, TransactionRepository, MarketMakerRepository } from '../../../..';
export declare type ConstantBondingCurveAMMSettings = {
    initialUnits?: number;
    initialValue?: number;
    initialPrice?: number;
};
export declare class ConstantBondingCurveAMM extends BondingCurveAMM {
    static newMaker(assetRepository: AssetRepository, portfolioRepository: PortfolioRepository, transactionRepository: TransactionRepository, marketMakerRepository: MarketMakerRepository, config: TNewMarketMakerConfig): ConstantBondingCurveAMM;
    private computeInitialState;
    constructor(assetRepository: AssetRepository, portfolioRepository: PortfolioRepository, transactionRepository: TransactionRepository, marketMakerRepository: MarketMakerRepository, props: TMarketMaker);
}
