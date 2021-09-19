import { MarketOrder, MakerTrade } from '../../../..';
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
    private portfolioRepository;
    static newMaker(props: TNewMakerConfig): Bonding2Maker;
    constructor(props: TMaker);
    computeInitialState(newMakerConfig: TNewMakerConfig): TBonding2MakerParams;
    computeStateUpdate(stateUpdate: TBonding2MakerParamsUpdate): {
        "params.madeUnits": FirebaseFirestore.FieldValue;
        currentPrice: number;
    };
    processOrder(order: MarketOrder): Promise<MakerTrade | null>;
    processSimpleOrder(assetId: string, orderSide: string, orderSize: number): Promise<null>;
    updateMakerStateAsync(assetId: string, data: any): Promise<void>;
    buy(userId: string, assetId: string, units: number): Promise<null>;
    sell(userId: string, assetId: string, units: number): Promise<null>;
    private processOrderUnits;
}
export {};
