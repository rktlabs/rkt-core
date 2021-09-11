import { TakerFill } from './takerFill';
import { MakerFill } from './makerFill';
import { MarketOrder } from '.';
export declare class Trade {
    tradeId: string;
    assetId: string;
    executedAt: string;
    taker: TakerFill;
    makers: MakerFill[];
    constructor(takerOrder: MarketOrder);
    fillMaker(makerFill: MakerFill, makerUnitDelta: number, makerCoinDelta: number): void;
}
