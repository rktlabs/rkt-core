import { OrderType, OrderSide, OperationType } from '../..';
export declare type TNewExchangeOrderConfig = {
    operation: OperationType;
    portfolioId: string;
    orderId: string;
    assetId: string;
    orderType: OrderType;
    orderSide: OrderSide;
    orderSize: number;
    orderPrice?: number;
    sizeRemaining?: number;
    tags?: any;
};
export declare type TExchangeCancelOrder = {
    operation: OperationType;
    portfolioId: string;
    orderId: string;
};
export declare type TExchangeOrder = {
    operation: OperationType;
    portfolioId: string;
    orderId: string;
    assetId: string;
    orderType: OrderType;
    orderSide: OrderSide;
    orderSize: number;
    orderPrice?: number;
    sizeRemaining?: number;
    tags?: any;
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
export declare type TExchangeOrderFailed = {
    orderId: string;
    portfolioId: string;
    eventType: string;
    publishedAt: string;
    reason: string;
};
