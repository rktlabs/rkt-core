export declare type TLeagueEarnerDef = {
    earnerId: string;
    initialPrice: number;
    displayName: string;
};
export declare type TNewLeague = {
    leagueId: string;
    ownerId: string;
    displayName?: string;
    description?: string;
    startAt?: string;
    endAt?: string;
    acceptEarningsAfter?: string;
    ignoreEarningsAfter?: string;
    key?: string;
    pt?: number;
    tags?: any;
    earnerList?: TLeagueEarnerDef[];
};
export declare type TLeague = {
    createdAt: string;
    leagueId: string;
    ownerId: string;
    portfolioId: string;
    displayName: string;
    description: string;
    startAt?: string;
    endAt?: string;
    acceptEarningsAfter?: string;
    ignoreEarningsAfter?: string;
    key?: string;
    pt?: number;
    tags?: any;
    managedAssets: string[];
    currencyId: string;
    currencySource: string;
};
export declare type TLeagueUpdate = {
    managedAssets: string[];
};
