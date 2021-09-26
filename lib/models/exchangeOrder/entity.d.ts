import { TExchangeOrder, TNewExchangeOrderConfig } from '.';
import { OperationType, OrderSide, OrderType } from '../..';
export declare class ExchangeOrder {
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
    constructor(props: TExchangeOrder);
    static newExchangeOrder(props: TNewExchangeOrderConfig): ExchangeOrder;
    static validate(jsonPayload: any): import("jsonschema").ValidatorResult;
    static serialize(selfUrl: string, baseUrl: string, data: any): any;
    static serializeCollection(selfUrl: string, baseUrl: string, qs: any, data: any): any;
}
