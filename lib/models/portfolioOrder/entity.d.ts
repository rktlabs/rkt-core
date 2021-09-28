import { TPortfolioOrder, TNewPortfolioOrderProps } from '.';
import { OrderSide, OrderType } from '../..';
export declare class PortfolioOrder {
    createdAt: string;
    orderId: string;
    assetId: string;
    orderSide: OrderSide;
    orderSize: number;
    orderStatus: string;
    orderState: string;
    orderType: OrderType;
    reason?: string;
    orderPrice?: number;
    events: any[];
    tags?: any;
    xids?: any;
    closedAt?: string;
    executedAt?: string;
    filledPrice?: number;
    filledSize?: number;
    filledValue?: number;
    sizeRemaining?: number;
    constructor(props: TPortfolioOrder);
    static newOrder(props: TNewPortfolioOrderProps): PortfolioOrder;
    static validate(jsonPayload: any): import("jsonschema").ValidatorResult;
    static serialize(selfUrl: string, portfolioId: string, baseUrl: string, data: any): any;
    static serializeCollection(selfUrl: string, portfolioId: string, baseUrl: string, qs: any, data: any): any;
}
