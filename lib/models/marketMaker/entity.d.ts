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
}
