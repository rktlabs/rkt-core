import { MarketOrder, Trade } from '../../../..';
import { MakerBase } from '../makerBase/entity';
import { IMaker } from '../makerBase/interfaces';
import { TNewMakerConfig, TMaker, TTakeResult } from '../makerBase/types';
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
    computeMakerInitialState(newMakerConfig: TNewMakerConfig): TBonding2MakerParams;
    computeMakerStateUpdate(stateUpdate: TBonding2MakerParamsUpdate): {
        "params.madeUnits": FirebaseFirestore.FieldValue;
        currentPrice: number;
    };
    processOrder(maker: IMaker, order: MarketOrder): Promise<Trade | null>;
    updateMakerStateAsync(assetId: string, data: any): Promise<void>;
    processOrderUnits(takeSize: number): TTakeResult | null;
}
export {};
