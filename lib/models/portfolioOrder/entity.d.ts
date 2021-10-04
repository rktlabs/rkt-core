import { TPortfolioOrder } from '.';
import { TOrderInput } from '..';
export declare class PortfolioOrder {
    createdAt: string;
    orderId: string;
    orderInput: TOrderInput;
    orderStatus: string;
    orderState: string;
    reason?: string;
    events: any[];
    closedAt?: string;
    executedAt?: string;
    filledPrice?: number;
    filledSize?: number;
    filledValue?: number;
    sizeRemaining?: number;
    constructor(props: TPortfolioOrder);
    static newOrder(orderInput: TOrderInput): PortfolioOrder;
    static validate(jsonPayload: any): import("jsonschema").ValidatorResult;
}
