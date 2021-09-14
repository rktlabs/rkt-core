import { OrderSide, OrderType } from './types';
export declare class TakerFill {
    readonly assetId: string;
    readonly orderSide: string;
    readonly orderSize: number;
    readonly orderId: string;
    readonly portfolioId: string;
    readonly orderType?: string;
    readonly tags?: any;
    sizeRemaining: number;
    filledSize: number;
    filledValue: number;
    filledPrice: number;
    isPartial: boolean;
    isClosed: boolean;
    isLiquidityStarved: boolean;
    constructor(opts: {
        assetId: string;
        orderSide: OrderSide;
        orderSize: number;
        orderId: string;
        orderType?: OrderType;
        portfolioId: string;
        sizeRemaining?: number;
        tags?: any;
    });
    reduceSizeRemaining(sizeReduction: number): number;
    fill(size: number, value: number): void;
}
