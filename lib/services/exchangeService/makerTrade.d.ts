import { TakerFill } from './takerFill';
import { MakerFill } from './makerFill';
import { TakerOrder } from '.';
export declare class MakerTrade {
    tradeId: string;
    assetId: string;
    executedAt: string;
    taker: TakerFill;
    makers: MakerFill[];
    constructor(takerOrder: TakerOrder);
    fillMaker(makerFill: MakerFill, makerUnitDelta: number, makerCoinDelta: number): void;
}
