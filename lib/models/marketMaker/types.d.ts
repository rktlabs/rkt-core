import { TExchangeQuote } from '..';
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
    quote?: TExchangeQuote;
};
