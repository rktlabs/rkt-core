import { OrderType, OrderSide } from '../..';
export declare type TOrderInput = {
    sourceOrderId?: string;
    portfolioId: string;
    nonce?: string;
    signature?: string;
    assetId: string;
    orderSide: OrderSide;
    orderSize: number;
    orderType: OrderType;
    orderPrice?: number;
    tags?: any;
    xids?: any;
};
export declare type TExchangeOrder = {
    orderId: string;
    portfolioId: string;
    orderInput: TOrderInput;
    sizeRemaining?: number;
    events: any[];
    orderStatus: string;
    orderState: string;
    createdAt: string;
    closedAt?: string;
    reason?: string;
    filledPrice?: number;
    filledSize?: number;
    filledValue?: number;
    executedAt?: string;
};
export declare type TExchangeOrderPatch = {
    closedAt?: string;
    filledPrice?: number;
    filledSize?: number;
    filledValue?: number;
    sizeRemaining?: number;
    orderStatus?: string;
    orderState?: string;
    reason?: string;
    executedAt?: string;
};
export declare type TExchangeOrderFill = {
    orderId: string;
    portfolioId: string;
    eventType: string;
    publishedAt: string;
    filledSize: number;
    filledValue: number;
    filledPrice: number;
    sizeRemaining: number;
    tradeId: string;
};
export declare type TExchangeOrderComplete = {
    orderId: string;
    portfolioId: string;
    eventType: string;
    publishedAt: string;
};
