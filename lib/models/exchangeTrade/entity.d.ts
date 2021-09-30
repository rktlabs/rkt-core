import { TExchangeOrder } from '..';
import { TTaker, TMaker, OrderSide } from '.';
export declare class ExchangeTrade {
    tradeId: string;
    executedAt: string;
    assetId: string;
    taker: TTaker;
    makers: TMaker[];
    createdAt?: string;
    constructor(order: TExchangeOrder);
    supplyMakerSide(opts: {
        orderId?: string;
        assetId: string;
        orderSide: OrderSide;
        orderSize: number;
        portfolioId: string;
        sizeRemaining?: number;
        makerDeltaUnits: number;
        makerDeltaValue: number;
    }): TMaker;
    static serialize(selfUrl: string, baseUrl: string, data: any): any;
    static serializeCollection(selfUrl: string, baseUrl: string, qs: any, data: any): any;
    private _fillMaker;
    private _updateTakerFill;
    private _updateMakerFill;
    private _generateTaker;
}
