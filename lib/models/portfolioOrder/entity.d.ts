import { TPortfolioOrder } from '.';
import { TOrderSource } from '..';
export declare class PortfolioOrder {
    createdAt: string;
    orderId: string;
    orderSource: TOrderSource;
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
    static newOrder(orderSource: TOrderSource): PortfolioOrder;
    static validate(jsonPayload: any): import("jsonschema").ValidatorResult;
    static serialize(selfUrl: string, portfolioId: string, baseUrl: string, data: any): any;
    static serializeCollection(selfUrl: string, portfolioId: string, baseUrl: string, qs: any, data: any): any;
}
