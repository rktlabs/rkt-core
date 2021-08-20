export declare type TNewAsset = {
    ownerId: string;
    symbol: string;
    displayName?: string;
    contractId: string;
    contractDisplayName?: string;
    earnerId?: string;
    earnerDisplayName?: string;
    tags?: any;
    xids?: any;
    initialPrice?: number;
};
export declare type TAssetCache = {
    assetId: string;
    symbol: string;
    type: string;
    portfolioId?: string;
    contractId: string;
    cumulativeEarnings: number;
};
export declare type TAsset = {
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
};
export declare type TAssetUpdate = {
    bid?: number;
    ask?: number;
    last?: number;
    cumulativeEarnings?: number;
};
export declare type TAssetHolder = {
    assetId: string;
    portfolioId: string;
    units: number;
};
export declare type TAssetHolderPatch = {
    units?: number;
};
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
    static serialize(req: any, data: any): any;
    static serializeCollection(req: any, data: any): any;
}
