import { TExchangeOrder, TNewExchangeOrderConfig } from '.';
export declare class ExchangeOrder {
    operation: string;
    orderType: string;
    orderSide: string;
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
    refOrderId?: string;
    error?: string;
    constructor(props: TExchangeOrder);
    static newExchangeOrder(props: TNewExchangeOrderConfig): ExchangeOrder;
    static validate(jsonPayload: any): import("jsonschema").ValidatorResult;
    static serialize(selfUrl: string, baseUrl: string, data: any): any;
    static serializeCollection(selfUrl: string, baseUrl: string, qs: any, data: any): any;
}
