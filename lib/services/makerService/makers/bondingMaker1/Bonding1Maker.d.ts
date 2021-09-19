import { TakerOrder as TakerOrder, MakerTrade } from '../../../..';
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
    private portfolioRepository;
    private assetHolderRepository;
    private mintService;
    static newMaker(props: TNewMakerConfig): Bonding1Maker;
    constructor(props: TMaker);
    computeInitialState(newMakerConfig: TNewMakerConfig): TBonding1MakerParams;
    computeStateUpdate(stateUpdate: TBonding1MakerParamsUpdate): {
        "params.madeUnits": FirebaseFirestore.FieldValue;
        currentPrice: number;
    };
    processTakerOrder(order: TakerOrder): Promise<MakerTrade | null>;
    processSimpleOrder(assetId: string, orderSide: string, orderSize: number): Promise<{
        makerDeltaUnits: number;
        makerDeltaCoins: number;
    } | null>;
    updateMakerStateAsync(assetId: string, data: any): Promise<void>;
    private processOrderUnits;
}
export {};
