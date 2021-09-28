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
    events: any[];
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
    constructor(props: TExchangeOrder);
    static newExchangeOrder(props: TNewExchangeOrderConfig): ExchangeOrder;
    static validate(jsonPayload: any): import("jsonschema").ValidatorResult;
    static serialize(selfUrl: string, baseUrl: string, data: any): any;
    static serializeCollection(selfUrl: string, baseUrl: string, qs: any, data: any): any;
}
