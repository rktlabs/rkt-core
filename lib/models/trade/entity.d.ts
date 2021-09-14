export declare class Trade {
    createdAt: string;
    tradeId?: string;
    constructor(props: any);
    static newTrade(props: any): Trade;
    static serialize(selfUrl: string, baseUrl: string, data: any): any;
    static serializeCollection(selfUrl: string, baseUrl: string, qs: any, data: any): any;
    static validate(jsonPayload: any): void;
}
