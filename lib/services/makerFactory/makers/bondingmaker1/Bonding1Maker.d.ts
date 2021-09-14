import { MarketOrder, Trade } from '../../../..';
import { MakerBase } from '../makerBase/entity';
import { IMaker } from '../makerBase/interfaces';
import { TNewMakerConfig, TMaker, TTakeResult } from '../makerBase/types';
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
    static newMaker(props: TNewMakerConfig): Bonding1Maker;
    constructor(props: TMaker);
    computeMakerInitialState(newMakerConfig: TNewMakerConfig): TBonding1MakerParams;
    computeMakerStateUpdate(stateUpdate: TBonding1MakerParamsUpdate): {
        "params.madeUnits": FirebaseFirestore.FieldValue;
        currentPrice: number;
    };
    processOrder(maker: IMaker, order: MarketOrder): Promise<Trade | null>;
    updateMakerStateAsync(assetId: string, data: any): Promise<void>;
    processOrderUnits(takeSize: number): TTakeResult | null;
}
export {};
