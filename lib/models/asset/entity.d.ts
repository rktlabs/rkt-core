import { TAsset, TNewAsset } from '.';
export declare class Asset {
    createdAt: string;
    type: string;
    symbol: string;
    assetId: string;
    ownerId: string;
    portfolioId?: string;
    displayName: string;
    leagueId: string;
    leagueDisplayName: string;
    tags?: any;
    initialPrice?: number;
    bid?: number;
    ask?: number;
    last?: number;
    constructor(props: TAsset);
    toString(): string;
    static newAsset(props: TNewAsset): Asset;
    static validate(jsonPayload: any): import("jsonschema").ValidatorResult;
    static serialize(selfUrl: string, baseUrl: string, data: any): any;
    static serializeCollection(selfUrl: string, baseUrl: string, qs: any, data: any): any;
}
