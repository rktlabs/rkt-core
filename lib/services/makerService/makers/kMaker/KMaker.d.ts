import { MarketOrder, Trade } from '../../../..';
import { MakerBase } from '../makerBase/entity';
import { IMaker } from '../makerBase/interfaces';
import { TNewMakerConfig, TMaker, TTakeResult } from '../makerBase/types';
declare type TKMakerParamsUpdate = {
    madeUnitsDelta: number;
    currentPrice: number;
    poolUnitDelta: number;
    poolCoinDelta: number;
    kDelta: number;
};
declare type TKMakerParams = {
    madeUnits: number;
    x0: number;
    poolUnits: number;
    poolCoins: number;
    k: number;
};
export declare class KMaker extends MakerBase {
    private portfolioRepository;
    static newMaker(props: TNewMakerConfig): KMaker;
    constructor(props: TMaker);
    computeMakerInitialState(newMakerConfig: TNewMakerConfig): TKMakerParams;
    computeMakerStateUpdate(stateUpdate: TKMakerParamsUpdate): {
        "params.poolCoins": FirebaseFirestore.FieldValue;
        "params.poolUnits": FirebaseFirestore.FieldValue;
        "params.k": FirebaseFirestore.FieldValue;
        madeUnits: FirebaseFirestore.FieldValue;
        currentPrice: number;
    };
    processOrder(maker: IMaker, order: MarketOrder): Promise<Trade | null>;
    updateMakerStateAsync(assetId: string, data: any): Promise<void>;
    processOrderUnits(takeSize: number): TTakeResult | null;
    private computePrice;
}
export {};
