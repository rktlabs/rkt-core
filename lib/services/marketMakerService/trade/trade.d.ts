import { OrderSide, TTaker, TMaker, TOrder } from '../..';
export declare class Trade {
    tradeId: string;
    executedAt: string;
    assetId: string;
    taker: TTaker;
    makers: TMaker[];
    constructor(order: TOrder);
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
    private _fillMaker;
    private _updateTakerFill;
    private _updateMakerFill;
    private _generateTaker;
}
