import { MakerBase } from '../makerBase/entity';
import { TNewMakerConfig, TMaker } from '../makerBase/types';
declare type TBonding1MakerParamsUpdate = {
    madeUnitsDelta: number;
    currentPrice: number;
};
declare type TBonding1MakerParams = {
    madeUnits: number;
    x0: number;
};
export declare class Bonding1Maker extends MakerBase {
    private assetHolderRepository;
    private mintService;
    static newMaker(props: TNewMakerConfig): Bonding1Maker;
    constructor(props: TMaker);
    computeInitialState(newMakerConfig: TNewMakerConfig): TBonding1MakerParams;
    computeStateUpdate(stateUpdate: TBonding1MakerParamsUpdate): {
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
