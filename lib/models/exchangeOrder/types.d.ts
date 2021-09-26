import { OrderType, OrderSide, OperationType } from '../..';
export declare type TNewExchangeOrderConfig = {
    operation: OperationType;
    orderType: OrderType;
    orderSide: OrderSide;
    assetId: string;
    portfolioId: string;
    orderPrice?: number;
    orderSize: number;
    orderId: string;
    tags?: any;
};
export declare type TExchangeCancelOrder = {
    operation: OperationType;
    portfolioId: string;
    orderId: string;
};
export declare type TExchangeOrder = {
    operation: OperationType;
    orderType: OrderType;
    orderSide: OrderSide;
    assetId: string;
    portfolioId: string;
    orderPrice?: number;
    orderSize: number;
    orderId: string;
    tags?: any;
    createdAt: string;
    status: string;
    state: string;
    sizeRemaining?: number;
    closedAt?: string;
    reason?: string;
    filledPrice?: number;
    filledSize?: number;
    filledValue?: number;
    executedAt?: string;
};
export declare type TExchangeOrderPatch = {
    status?: string;
    state?: string;
    closedAt?: string;
    executedAt?: string;
    reason?: string;
    sizeRemaining?: number;
    filledPrice?: number;
    filledSize?: number;
    filledValue?: number;
};
