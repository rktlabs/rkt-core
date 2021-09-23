import { OrderSide, TTaker, TMaker, TOrder } from '../..';
export declare class Trade {
    tradeId: string;
    executedAt: string;
    assetId: string;
    taker: TTaker;
    makers: TMaker[];
    constructor(order: TOrder);
    supplyMakerSide(opts: {
        assetId: string;
        orderSide: OrderSide;
        orderSize: number;
        portfolioId: string;
        sizeRemaining?: number;
        makerDeltaUnits: number;
        makerDeltaValue: number;
    }): TMaker;
    private fillMaker;
    private updateTakerFill;
    private updateMakerFill;
    private generateTaker;
}
