export declare type TNewLeague = {
    leagueId: string;
    ownerId: string;
    displayName?: string;
    description?: string;
    tags?: any;
};
export declare type TLeague = {
    createdAt: string;
    leagueId: string;
    ownerId: string;
    portfolioId: string;
    displayName: string;
    description: string;
    tags?: any;
    managedAssets: string[];
};
export declare type TLeagueUpdate = {
    managedAssets: string[];
};
