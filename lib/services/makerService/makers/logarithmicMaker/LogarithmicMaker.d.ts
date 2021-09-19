import { MarketOrder, MakerTrade } from '../../../..';
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
    private portfolioRepository;
    static newMaker(props: TNewMakerConfig): LogarithmicMaker;
    constructor(props: TMaker);
    computeInitialState(newMakerConfig: TNewMakerConfig): TLogarithmicMakerParams;
    computeStateUpdate(stateUpdate: TLogarithmicParamsUpdate): {
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
