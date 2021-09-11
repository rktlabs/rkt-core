export declare type TNewAsset = {
    ownerId: string;
    symbol: string;
    displayName?: string;
    leagueId: string;
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
    leagueId: string;
    leagueDisplayName: string;
    tags?: any;
    xids?: any;
    bid?: number;
    ask?: number;
    last?: number;
};
export declare type TAssetUpdate = {
    bid?: number;
    ask?: number;
    last?: number;
};
export declare type TLeagueAssetDef = {
    assetId: string;
    displayName: string;
    initialPrice: number;
};
