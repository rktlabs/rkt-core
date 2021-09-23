import { TPortfolioOrderEvent, TPortfolioOrder, TNewOrderProps } from '.';
export declare class PortfolioOrder {
    createdAt: string;
    orderId: string;
    assetId: string;
    portfolioId: string;
    orderSide: string;
    orderSize: number;
    status: string;
    state: string;
    orderType: string;
    reason?: string;
    orderPrice?: number;
    events: TPortfolioOrderEvent[];
    tags?: any;
    xids?: any;
    closedAt?: string;
    filledPrice?: number;
    filledSize?: number;
    filledValue?: number;
    sizeRemaining?: number;
    constructor(props: TPortfolioOrder);
    static newOrder(props: TNewOrderProps): PortfolioOrder;
    static validate(jsonPayload: any): import("jsonschema").ValidatorResult;
    static serialize(selfUrl: string, portfolioId: string, baseUrl: string, data: any): any;
    static serializeCollection(selfUrl: string, portfolioId: string, baseUrl: string, qs: any, data: any): any;
}
