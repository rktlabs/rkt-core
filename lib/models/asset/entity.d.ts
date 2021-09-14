import { TAsset, TNewAsset } from '.';
export declare class Asset {
    createdAt: string;
    type: string;
    symbol: string;
    assetId: string;
    displayName: string;
    ownerId: string;
    portfolioId?: string;
    leagueId?: string;
    leagueDisplayName?: string;
    tags?: any;
    xids?: any;
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
