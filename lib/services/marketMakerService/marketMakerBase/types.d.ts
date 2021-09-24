export declare type TNewMarketMakerConfig = {
    type: string;
    ownerId: string;
    assetId: string;
    settings?: any;
    tags?: any;
    params?: any;
};
export declare type TMarketMaker = {
    createdAt: string;
    portfolioId?: string;
    type: string;
    ownerId: string;
    assetId: string;
    tags?: any;
    params?: any;
    quote?: TMarketMakerQuote;
};
export declare type TMarketMakerPatch = {
    params?: any;
};
export declare type TMarketMakerQuote = {
    last?: {
        side: string;
        units: number;
        value: number;
        unitValue: number;
    };
    current: number;
    bid1: number;
    ask1: number;
    bid10: number;
    ask10: number;
};
export declare type TMakerResult = {
    makerDeltaUnits: number;
    makerDeltaValue: number;
    stateUpdate: any;
    quote: TMarketMakerQuote;
};
