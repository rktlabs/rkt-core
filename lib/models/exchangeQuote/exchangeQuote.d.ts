export declare type TExchangeQuote = {
    assetId: string;
    bid: number;
    ask: number;
    quoteAt: string;
    lastTrade?: {
        executedAt: string;
        price: number;
        side: string;
        volume: number;
    };
};
export declare class ExchangeQuote {
    static serialize(req: any, data: any): any;
    static serializeCollection(req: any, data: any): any;
}
