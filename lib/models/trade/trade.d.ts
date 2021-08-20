export declare class Trade {
    createdAt: string;
    tradeId?: string;
    constructor(props: any);
    static newTrade(props: any): Trade;
    static serialize(req: any, data: any): any;
    static serializeCollection(req: any, data: any): any;
    static validate(jsonPayload: any): void;
}
