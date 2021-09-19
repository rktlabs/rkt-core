import { MakerBase } from '../makerBase/entity';
import { TNewMakerConfig, TMaker } from '../makerBase/types';
declare type TBonding2MakerParamsUpdate = {
    madeUnitsDelta: number;
    currentPrice: number;
};
declare type TBonding2MakerParams = {
    madeUnits: number;
    x0: number;
};
export declare class Bonding2Maker extends MakerBase {
    private assetHolderRepository;
    private mintService;
    static newMaker(props: TNewMakerConfig): Bonding2Maker;
    constructor(props: TMaker);
    computeInitialState(newMakerConfig: TNewMakerConfig): TBonding2MakerParams;
    computeStateUpdate(stateUpdate: TBonding2MakerParamsUpdate): {
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
