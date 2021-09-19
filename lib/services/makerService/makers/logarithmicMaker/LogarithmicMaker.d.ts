import { MakerBase } from '../makerBase/entity';
import { TNewMakerConfig, TMaker } from '../makerBase/types';
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
    private assetHolderRepository;
    private mintService;
    static newMaker(props: TNewMakerConfig): LogarithmicMaker;
    constructor(props: TMaker);
    computeInitialState(newMakerConfig: TNewMakerConfig): TLogarithmicMakerParams;
    computeStateUpdate(stateUpdate: TLogarithmicParamsUpdate): {
        "params.madeUnits": FirebaseFirestore.FieldValue;
        currentPrice: number;
    };
    processOrderImpl(orderSide: string, orderSize: number): Promise<{
        makerDeltaUnits: number;
        makerDeltaCoins: number;
    } | null>;
    private processOrderUnits;
}
export {};
