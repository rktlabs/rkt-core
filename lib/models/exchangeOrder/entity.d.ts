import { TExchangeOrder, TOrderSource } from '.';
export declare class ExchangeOrder {
    portfolioId: string;
    orderId: string;
    orderSource: TOrderSource;
    createdAt: string;
    orderStatus: string;
    orderState: string;
    sizeRemaining?: number;
    closedAt?: string;
    executedAt?: string;
    reason?: string;
    filledPrice?: number;
    filledSize?: number;
    filledValue?: number;
    events: any[];
    constructor(props: TExchangeOrder);
    static newExchangeOrder(orderSource: TOrderSource): ExchangeOrder;
    static validate(jsonPayload: any): import("jsonschema").ValidatorResult;
    static serialize(selfUrl: string, baseUrl: string, data: any): any;
    static serializeCollection(selfUrl: string, baseUrl: string, qs: any, data: any): any;
}
