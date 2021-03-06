export declare type TNewAssetConfig = {
    ownerId: string;
    symbol: string;
    displayName?: string;
    leagueId?: string;
    leagueDisplayName?: string;
    subject?: any;
    tags?: any;
    xids?: any;
};
export declare type TAsset = {
    createdAt: string;
    type: string;
    symbol: string;
    assetId: string;
    ownerId: string;
    portfolioId?: string;
    displayName: string;
    leagueId?: string;
    leagueDisplayName?: string;
    issuedUnits: number;
    burnedUnits: number;
    subject?: any;
    tags?: any;
    xids?: any;
    quote?: any;
};
export declare type TAssetCore = {
    assetId: string;
    displayName: string;
};
export declare type TAssetUpdate = {
    quote?: any;
};
export declare type TAssetUpdate2 = {
    issuedUnits?: number;
    burnedUnits?: number;
};
export declare type TLeagueAssetDef = {
    symbol: string;
    displayName: string;
};
