import { MakerBase } from '../makerBase/entity';
import { TNewMakerConfig, TMaker } from '../makerBase/types';
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
    static newMaker(props: TNewMakerConfig): KMaker;
    constructor(props: TMaker);
    computeInitialState(newMakerConfig: TNewMakerConfig): TKMakerParams;
    computeStateUpdate(stateUpdate: TKMakerParamsUpdate): {
        "params.poolCoins": FirebaseFirestore.FieldValue;
        "params.poolUnits": FirebaseFirestore.FieldValue;
        "params.k": FirebaseFirestore.FieldValue;
        madeUnits: FirebaseFirestore.FieldValue;
        currentPrice: number;
    };
    processOrderImpl(orderSide: string, orderSize: number): Promise<{
        makerDeltaUnits: number;
        makerDeltaCoins: number;
    } | null>;
    private processOrderUnits;
    private computePrice;
}
export {};
