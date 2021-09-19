import { TakerOrder, MakerTrade } from '../../..';
export interface IMaker {
    processTakerOrder(order: TakerOrder): Promise<MakerTrade | null>;
    processSimpleOrder(assetId: string, orderSide: string, orderSize: number): Promise<{
        makerDeltaUnits: number;
        makerDeltaCoins: number;
    } | null>;
}
