import { MarketOrder, MakerTrade } from '../../..';
import { TNewMakerConfig } from './types';
export interface IMaker {
    computeStateUpdate(stateUpdate: any): any;
    computeInitialState(newMakerConfig: TNewMakerConfig): any;
    processOrder(order: MarketOrder): Promise<MakerTrade | null>;
    buy(userId: string, assetId: string, units: number): Promise<MakerTrade | null>;
    sell(userId: string, assetId: string, units: number): Promise<MakerTrade | null>;
    processSimpleOrder(assetId: string, orderSide: string, orderSize: number): Promise<{
        makerDeltaUnits: number;
        makerDeltaCoins: number;
    } | null>;
}
