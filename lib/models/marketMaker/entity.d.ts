import { TMarketMaker } from './types';
export declare abstract class MarketMaker {
    createdAt: string;
    type: string;
    ownerId: string;
    assetId: string;
    portfolioId?: string;
    tags?: any;
    params?: any;
    quote?: any;
    constructor(props: TMarketMaker);
    static serialize(selfUrl: string, baseUrl: string, data: any): any;
    static serializeCollection(selfUrl: string, baseUrl: string, qs: any, data: any): any;
}
