export declare type TNewAssetConfig = {
    ownerId: string;
    symbol: string;
    displayName?: string;
    leagueId?: string;
    leagueDisplayName?: string;
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
    tags?: any;
    xids?: any;
    bid?: number;
    ask?: number;
    last?: number;
};
export declare type TAssetCore = {
    assetId: string;
    displayName: string;
};
export declare type TAssetUpdate = {
    bid?: number;
    ask?: number;
    last?: number;
};
export declare type TLeagueAssetDef = {
    symbol: string;
    displayName: string;
};
