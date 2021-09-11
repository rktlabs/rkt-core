export declare type OrderSide = 'bid' | 'ask';
export declare type OrderType = 'market';
export declare type OrderStatus = 'new' | 'partial' | 'filled' | 'liquidityStarved';
export declare type OrderState = 'open' | 'closed';
export declare type TLastTrade = {
    side: string;
    price: number;
    volume: number;
    executedAt: string;
};
export declare type TQuote = {
    assetId: string;
    quoteAt: string;
    bid: number;
    ask: number;
    lastTrade?: TLastTrade;
};
export declare type TMarketOrderOpts = {
    assetId: string;
    orderId: string;
    portfolioId: string;
    orderSide: OrderSide;
    orderSize: number;
    orderType?: OrderType;
    tags?: any;
    sizeRemaining?: number;
};
