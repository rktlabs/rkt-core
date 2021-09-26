import { OrderSide, OrderType } from '../..';
export declare type TNewPortfolioOrderProps = {
    orderId?: string;
    assetId: string;
    portfolioId: string;
    orderSide: OrderSide;
    orderSize: number;
    orderType: OrderType;
    orderPrice?: number;
    tags?: any;
    xids?: any;
};
export declare type TPortfolioOrder = {
    createdAt: string;
    orderId: string;
    assetId: string;
    portfolioId: string;
    orderSide: OrderSide;
    orderSize: number;
    status: string;
    state: string;
    orderType: OrderType;
    reason?: string;
    orderPrice?: number;
    events: any[];
    tags?: any;
    xids?: any;
    closedAt?: string;
    filledPrice?: number;
    filledSize?: number;
    filledValue?: number;
    sizeRemaining?: number;
};
export declare type TPortfolioOrderPatch = {
    closedAt?: string;
    filledPrice?: number;
    filledSize?: number;
    filledValue?: number;
    sizeRemaining?: number;
    status?: string;
    state?: string;
    reason?: string;
};
export declare type TPortfolioOrderEvent = {
    orderId: string;
    portfolioId: string;
    eventType: string;
    publishedAt: string;
};
export declare type TPortfolioOrderFill = TPortfolioOrderEvent & {
    filledSize: number;
    filledValue: number;
    filledPrice: number;
    sizeRemaining: number;
    tradeId: string;
};
export declare type TPortfolioOrderComplete = TPortfolioOrderEvent;
export declare type TPortfolioOrderFailed = TPortfolioOrderEvent & {
    reason: string;
};
