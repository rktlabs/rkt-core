export declare type TExchangeCancelOrder = {
    operation: string;
    assetId: string;
    portfolioId: string;
    orderId: string;
    refOrderId: string;
};
export declare type TNewExchangeOrder = {
    operation: string;
    orderType: string;
    orderSide: string;
    assetId: string;
    portfolioId: string;
    orderPrice?: number;
    orderSize: number;
    orderId: string;
    tags?: any;
};
export declare type TExchangeOrder = {
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
    refOrderId?: string;
    closedAt?: string;
    error?: string;
};
export declare type TExchangeOrderPatch = {
    status?: string;
    state?: string;
    closedAt?: string;
    executedAt?: string;
    reason?: string;
    sizeRemaining?: number;
    filledPrice?: number;
    filledSize?: number;
    filledValue?: number;
};
