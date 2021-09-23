import { MarketMakerRepository } from '../repositories/marketMaker/marketMakerRepository';
export declare class MakerQuery {
    marketMakerRepository: MarketMakerRepository;
    constructor();
    getListAsync(qs?: any): Promise<{
        data: import("..").TMarketMaker[];
    }>;
    getDetailAsync(id: string): Promise<import("..").TMarketMaker | null>;
}
