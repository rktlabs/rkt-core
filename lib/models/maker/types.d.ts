export declare type TNewMaker = {
    ownerId: string;
    symbol: string;
    displayName?: string;
    leagueId: string;
    leagueDisplayName?: string;
    tags?: any;
    xids?: any;
};
export declare type TMaker = {
    createdAt: string;
    type: string;
    symbol: string;
    makerId: string;
    ownerId: string;
    displayName: string;
    leagueId: string;
    leagueDisplayName: string;
    tags?: any;
    xids?: any;
    bid?: number;
    ask?: number;
    last?: number;
};
export declare type TMakerUpdate = {
    bid?: number;
    ask?: number;
    last?: number;
};
