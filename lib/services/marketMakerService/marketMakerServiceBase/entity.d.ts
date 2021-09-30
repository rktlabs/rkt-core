/// <reference types="node" />
import { EventEmitter } from 'events';
import { IMarketMakerService } from './interfaces';
import { ExchangeTrade, TExchangeOrder, TExchangeQuote, TMarketMaker, TNewExchangeOrderConfig } from '../../..';
export declare abstract class MarketMakerServiceBase implements IMarketMakerService {
    private emitter;
    marketMaker: TMarketMaker;
    constructor(props: TMarketMaker, emitter?: EventEmitter);
    on(event: string, listener: (...args: any[]) => void): void;
    emitQuote(quote: TExchangeQuote): void;
    emitTrade(trade: ExchangeTrade): void;
    emitCancelOrder(order: TExchangeOrder): void;
    emitExpirelOrder(order: TExchangeOrder): void;
    abstract processOrder(order: TNewExchangeOrderConfig): Promise<boolean>;
}
