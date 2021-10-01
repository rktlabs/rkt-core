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
    private _fillMaker;
    private _updateTakerFill;
    private _updateMakerFill;
    private _generateTaker;
}
