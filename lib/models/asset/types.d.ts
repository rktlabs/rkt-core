export declare type TNewAsset = {
    ownerId: string;
    symbol: string;
    displayName?: string;
    leagueId: string;
    leagueDisplayName?: string;
    tags?: any;
    initialPrice?: number;
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
    initialPrice?: number;
    bid?: number;
    ask?: number;
    last?: number;
};
export declare type TAssetUpdate = {
    bid?: number;
    ask?: number;
    last?: number;
};
