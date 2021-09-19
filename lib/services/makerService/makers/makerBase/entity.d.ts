import { MarketOrder } from '../../..';
import { AssetRepository, MakerRepository } from '../../../..';
import { MakerTrade } from '../../../exchangeService/makerTrade';
import { IMaker } from './interfaces';
import { TMaker, TNewMakerConfig } from './types';
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
    flattenMaker(): TMaker;
    static serialize(selfUrl: string, baseUrl: string, data: any): any;
    static serializeCollection(selfUrl: string, baseUrl: string, qs: any, data: any): any;
    abstract computeInitialState(newMakerConfig: TNewMakerConfig): any;
    abstract computeStateUpdate(stateUpdate: any): any;
    abstract processOrder(order: MarketOrder): Promise<MakerTrade | null>;
    abstract buy(userId: string, assetId: string, units: number): Promise<MakerTrade | null>;
    abstract sell(userId: string, assetId: string, units: number): Promise<MakerTrade | null>;
    abstract processSimpleOrder(assetId: string, orderSide: string, orderSize: number): Promise<{
        makerDeltaUnits: number;
        makerDeltaCoins: number;
    } | null>;
    onUpdateQuote: (trade: MakerTrade, bid: number, ask: number) => Promise<void>;
}
