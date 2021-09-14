import { MarketOrder, Trade } from '../../..';
import { AssetRepository, MakerRepository } from '../../../..';
import { IMaker } from './interfaces';
import { TMaker, TNewMakerConfig, TTakeResult } from './types';
export declare abstract class MakerBase implements IMaker {
    assetRepository: AssetRepository;
    makerRepository: MakerRepository;
    createdAt: string;
    type: string;
    ownerId: string;
    assetId: string;
    portfolioId?: string;
    currentPrice?: number;
    params?: any;
    constructor(props: TMaker);
    static serialize(selfUrl: string, baseUrl: string, data: any): any;
    static serializeCollection(selfUrl: string, baseUrl: string, qs: any, data: any): any;
    abstract computeMakerStateUpdate(stateUpdate: any): any;
    abstract processOrderUnits(takeSize: number): TTakeResult | null;
    abstract computeMakerInitialState(newMakerConfig: TNewMakerConfig): any;
    abstract processOrder(maker: IMaker, order: MarketOrder): Promise<Trade | null>;
    onUpdateQuote: (trade: Trade, bid: number, ask: number) => Promise<void>;
}
