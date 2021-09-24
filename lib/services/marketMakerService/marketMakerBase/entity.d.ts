import { TOrder, Trade } from '../..';
import { Asset, AssetRepository, MarketMakerRepository, PortfolioRepository, TransactionRepository } from '../../..';
import { IMarketMaker } from './interfaces';
import { TMakerResult, TMarketMaker } from './types';
export declare abstract class MarketMakerBase implements IMarketMaker {
    assetRepository: AssetRepository;
    portfolioRepository: PortfolioRepository;
    transactionRepository: TransactionRepository;
    marketMakerRepository: MarketMakerRepository;
    createdAt: string;
    type: string;
    ownerId: string;
    assetId: string;
    portfolioId?: string;
    tags?: any;
    params?: any;
    quote?: any;
    constructor(assetRepository: AssetRepository, portfolioRepository: PortfolioRepository, transactionRepository: TransactionRepository, props: TMarketMaker);
    flattenMaker(): TMarketMaker;
    resolveAssetSpec(assetSpec: string | Asset): Promise<any>;
    static serialize(selfUrl: string, baseUrl: string, data: any): any;
    static serializeCollection(selfUrl: string, baseUrl: string, qs: any, data: any): any;
    processOrder(order: TOrder): Promise<Trade | null>;
    abstract processOrderImpl(orderSide: string, orderSize: number): Promise<TMakerResult | null>;
}
