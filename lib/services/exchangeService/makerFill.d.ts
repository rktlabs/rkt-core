import { OrderSide } from './types';
export declare class MakerFill {
    readonly assetId: string;
    readonly orderSide: string;
    readonly orderSize: number;
    readonly portfolioId: string;
    sizeRemaining: number;
    filledSize: number;
    filledValue: number;
    filledPrice: number;
    isPartial: boolean;
    isClosed: boolean;
    constructor(opts: {
        assetId: string;
        orderSide: OrderSide;
        orderSize: number;
        portfolioId: string;
        sizeRemaining?: number;
    });
    reduceSizeRemaining(sizeReduction: number): number;
    fill(size: number, value: number): void;
}
