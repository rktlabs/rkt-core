/// <reference types="node" />
import { EventEmitter } from 'events';
import { IMarketMaker } from './interfaces';
import { TMarketMaker } from './types';
import { ExchangeTrade, TExchangeOrder, TExchangeQuote, TNewExchangeOrderConfig } from '../../..';
export declare abstract class MarketMakerBase implements IMarketMaker {
    private emitter;
    createdAt: string;
    type: string;
    ownerId: string;
    assetId: string;
    portfolioId?: string;
    tags?: any;
    params?: any;
    quote?: any;
    constructor(props: TMarketMaker, emitter?: EventEmitter);
    on(event: string, listener: (...args: any[]) => void): void;
    emitQuote(quote: TExchangeQuote): void;
    emitTrade(trade: ExchangeTrade): void;
    emitCancelOrder(order: TExchangeOrder): void;
    emitExpirelOrder(order: TExchangeOrder): void;
    static serialize(selfUrl: string, baseUrl: string, data: any): any;
    static serializeCollection(selfUrl: string, baseUrl: string, qs: any, data: any): any;
    abstract processOrder(order: TNewExchangeOrderConfig): Promise<boolean>;
}
