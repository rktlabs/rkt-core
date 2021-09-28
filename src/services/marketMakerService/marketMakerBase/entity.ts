'use strict'

import { EventEmitter } from 'events'
import { IMarketMaker } from './interfaces'
import { serialize, serializeCollection } from './serializer'
import { TMarketMaker } from './types'
import { ExchangeTrade, TExchangeOrder, TExchangeQuote, TNewExchangeOrderConfig } from '../../..'

// MarketMaker holds value and shares to be sold.
export abstract class MarketMakerBase implements IMarketMaker {
    private emitter: EventEmitter

    createdAt: string
    type: string
    ownerId: string
    assetId: string
    portfolioId?: string
    tags?: any
    params?: any
    quote?: any

    constructor(props: TMarketMaker, emitter?: EventEmitter) {
        this.createdAt = props.createdAt
        this.type = props.type
        this.assetId = props.assetId
        this.ownerId = props.ownerId
        this.portfolioId = props.portfolioId
        this.tags = props.tags
        this.params = props.params
        this.quote = props.quote

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
    // STATIC
    //////////////////////////////////////////////////////
    static serialize(selfUrl: string, baseUrl: string, data: any) {
        return serialize(selfUrl, baseUrl, data)
    }

    static serializeCollection(selfUrl: string, baseUrl: string, qs: any, data: any) {
        return serializeCollection(selfUrl, baseUrl, qs, data)
    }

    //////////////////////////////////////////////////////
    // ABSTRACT
    //////////////////////////////////////////////////////
    abstract processOrder(order: TNewExchangeOrderConfig): Promise<boolean>
}
