export declare type TNewMakerConfig = {
    type: string;
    ownerId: string;
    assetId: string;
    settings?: any;
    params?: any;
};
export declare type TMaker = {
    createdAt: string;
    portfolioId?: string;
    type: string;
    ownerId: string;
    assetId: string;
    params?: any;
    currentPrice?: number;
};
export declare type TMakerPatch = {
    params?: any;
    currentPrice?: number;
};
export declare type TTakeResult = {
    makerDeltaUnits: number;
    makerDeltaCoins: number;
    statusUpdate: any;
};
