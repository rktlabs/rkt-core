'use strict'

import { EventEmitter } from 'events'
import { IMarketMakerService } from './interfaces'
import { ExchangeTrade, TExchangeOrder, TExchangeQuote, TMarketMaker } from '../../..'

// MarketMaker holds value and shares to be sold.
export abstract class MarketMakerServiceBase implements IMarketMakerService {
    private emitter: EventEmitter

    marketMaker: TMarketMaker

    //constructor(props: TMarketMaker, emitter?: EventEmitter) {
    constructor(props: TMarketMaker, emitter?: EventEmitter) {
        this.marketMaker = props

        // uses assetid, quote, params.  factory uses assetId, portfolioId, quote, ownerid

        if (emitter) {
            this.emitter = emitter
        } else {
            this.emitter = new EventEmitter()
        }
    }

    on(event: string, listener: (...args: any[]) => void) {
        this.emitter.on(event, listener)
    }

    emitQuote(quote: TExchangeQuote) {
        this.emitter.emit('quote', quote)
    }

    emitTrade(trade: ExchangeTrade) {
        this.emitter.emit('trade', trade)
    }

    emitCancelOrder(order: TExchangeOrder) {
        this.emitter.emit('cancelOrder', order)
    }

    emitExpirelOrder(order: TExchangeOrder) {
        this.emitter.emit('exporeOrder', order)
    }

    //////////////////////////////////////////////////////
    // ABSTRACT
    //////////////////////////////////////////////////////
    abstract processOrder(order: TExchangeOrder): Promise<boolean>
}
