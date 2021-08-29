import { TAsset, TNewAsset } from '.';
export declare class Asset {
    createdAt: string;
    type: string;
    symbol: string;
    assetId: string;
    ownerId: string;
    portfolioId?: string;
    displayName: string;
    contractId: string;
    contractDisplayName: string;
    earnerId?: string;
    earnerDisplayName?: string;
    tags?: any;
    xids?: any;
    cumulativeEarnings: number;
    initialPrice?: number;
    bid?: number;
    ask?: number;
    last?: number;
    constructor(props: TAsset);
    toString(): string;
    static newAsset(props: TNewAsset): Asset;
    static validate(jsonPayload: any): import("jsonschema").ValidatorResult;
    static serialize(selfUrl: string, baseUrl: string, data: any): any;
    static serializeCollection(selfUrl: string, baseUrl: string, qs: any, data: any, rowcount: number): any;
}
