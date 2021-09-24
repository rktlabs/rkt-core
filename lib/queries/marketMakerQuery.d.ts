import { MarketMakerRepository } from '../repositories/marketMaker/marketMakerRepository';
export declare class MarketMakerQuery {
    marketMakerRepository: MarketMakerRepository;
    constructor(marketMakerRepository: MarketMakerRepository);
    getListAsync(qs?: any): Promise<{
        data: import("..").TMarketMaker[];
    }>;
    getDetailAsync(id: string): Promise<import("..").TMarketMaker | null>;
}
