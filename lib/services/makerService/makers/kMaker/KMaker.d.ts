import { TakerOrder, MakerTrade } from '../../../..';
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
    private portfolioRepository;
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
    processTakerOrder(order: TakerOrder): Promise<MakerTrade | null>;
    processSimpleOrder(assetId: string, orderSide: string, orderSize: number): Promise<null>;
    updateMakerStateAsync(assetId: string, data: any): Promise<void>;
    private processOrderUnits;
    private computePrice;
}
export {};
