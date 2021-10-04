import { TExchangeOrder, TOrderInput } from '.';
export declare class ExchangeOrder {
    portfolioId: string;
    orderId: string;
    orderInput: TOrderInput;
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
    static newExchangeOrder(orderInput: TOrderInput): ExchangeOrder;
    static validate(jsonPayload: any): import("jsonschema").ValidatorResult;
}
