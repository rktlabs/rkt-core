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
}
