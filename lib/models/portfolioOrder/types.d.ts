export declare type TNewOrderProps = {
    orderId?: string;
    assetId: string;
    portfolioId: string;
    orderSide: string;
    orderSize: number;
    orderType: string;
    orderPrice?: number;
    tags?: any;
    xids?: any;
};
export declare type TOrderEvent = {
    eventType: string;
    publishedAt: string;
    nonce: string;
    attributes?: any;
    messageId?: string;
};
export declare type TOrder = {
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
    events: TOrderEvent[];
    tags?: any;
    xids?: any;
    closedAt?: string;
    filledPrice?: number;
    filledSize?: number;
    filledValue?: number;
    sizeRemaining?: number;
};
export declare type TOrderPatch = {
    closedAt?: string;
    events?: TOrderEvent[];
    filledPrice?: number;
    filledSize?: number;
    filledValue?: number;
    status?: string;
    state?: string;
};
