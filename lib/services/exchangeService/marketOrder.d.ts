import { OrderType, OrderSide, OrderStatus, OrderState, TMarketOrderOpts } from './types';
export declare class MarketOrder {
    #private;
    readonly assetId: string;
    readonly orderId: string;
    readonly portfolioId: string;
    readonly orderType: OrderType;
    readonly orderSide: OrderSide;
    readonly orderSize: number;
    readonly tags?: any;
    orderStatus: OrderStatus;
    orderState: OrderState;
    get sizeRemaining(): number;
    constructor(opts: TMarketOrderOpts);
    reduceSizeRemaining(sizeReduction: number): number;
}
