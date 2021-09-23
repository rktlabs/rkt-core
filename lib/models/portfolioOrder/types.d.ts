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
export declare type TPortfolioOrderEvent = {
    notificationType: string;
    publishedAt: string;
    nonce: string;
    attributes?: any;
    messageId?: string;
};
export declare type TPortfolioOrder = {
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
};
export declare type TPortfolioOrderPatch = {
    closedAt?: string;
    events?: TPortfolioOrderEvent[];
    filledPrice?: number;
    filledSize?: number;
    filledValue?: number;
    status?: string;
    state?: string;
};
