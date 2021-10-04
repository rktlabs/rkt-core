import { TOrderInput } from '../..';
export declare type TPortfolioOrder = {
    orderId: string;
    orderInput: TOrderInput;
    filledPrice?: number;
    filledSize?: number;
    filledValue?: number;
    sizeRemaining?: number;
    orderStatus: string;
    orderState: string;
    createdAt: string;
    closedAt?: string;
    executedAt?: string;
    reason?: string;
    events: any[];
};
export declare type TPortfolioOrderPatch = {
    filledPrice?: number;
    filledSize?: number;
    filledValue?: number;
    sizeRemaining?: number;
    orderStatus?: string;
    orderState?: string;
    closedAt?: string;
    executedAt?: string;
    reason?: string;
};
