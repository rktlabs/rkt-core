import { TakerOrder, MakerTrade } from '../../..';
import { AssetRepository, MakerRepository } from '../../../..';
import { IMaker } from './interfaces';
import { TMaker } from './types';
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
    abstract processTakerOrder(order: TakerOrder): Promise<MakerTrade | null>;
    abstract processSimpleOrder(assetId: string, orderSide: string, orderSize: number): Promise<{
        makerDeltaUnits: number;
        makerDeltaCoins: number;
    } | null>;
    onUpdateQuote: (trade: MakerTrade, bid: number, ask: number) => Promise<void>;
}
