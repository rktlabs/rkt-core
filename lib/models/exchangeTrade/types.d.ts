export declare type TTakerFill = {
    assetId: string;
    filledPrice: number;
    filledSize: number;
    filledValue: number;
    isClosed: boolean;
    isLiquidityStarved: boolean;
    isPartial: boolean;
    orderSide: string;
    orderSize: number;
    portfolioId: string;
    sizeRemaining: number;
    orderId: string;
    orderType?: string;
    tags?: any;
};
export declare type TMakerFill = {
    assetId: string;
    filledPrice: number;
    filledSize: number;
    filledValue: number;
    isClosed: boolean;
    isPartial: boolean;
    orderSide: string;
    orderSize: number;
    portfolioId: string;
    sizeRemaining: number;
};
export declare type TExchangeTrade = {
    tradeId: string;
    assetId: string;
    executedAt: string;
    taker: TTakerFill;
    makers: TMakerFill[];
    createdAt?: string;
};
