import { MarketOrder, Trade } from '../../../..';
import { MakerBase } from '../makerBase/entity';
import { IMaker } from '../makerBase/interfaces';
import { TNewMakerConfig, TMaker, TTakeResult } from '../makerBase/types';
declare type TLogarithmicParamsUpdate = {
    madeUnitsDelta: number;
    currentPrice: number;
};
declare type TLogarithmicMakerParams = {
    madeUnits: number;
    price0: number;
    coinPool: number;
    limit: number;
    a: number;
    k: number;
};
export declare class LogarithmicMaker extends MakerBase {
    private portfolioRepository;
    static newMaker(props: TNewMakerConfig): LogarithmicMaker;
    constructor(props: TMaker);
    computeMakerInitialState(newMakerConfig: TNewMakerConfig): TLogarithmicMakerParams;
    computeMakerStateUpdate(stateUpdate: TLogarithmicParamsUpdate): {
        "params.madeUnits": FirebaseFirestore.FieldValue;
        currentPrice: number;
    };
    processOrder(maker: IMaker, order: MarketOrder): Promise<Trade | null>;
    updateMakerStateAsync(assetId: string, data: any): Promise<void>;
    processOrderUnits(takeSize: number): TTakeResult | null;
}
export {};
