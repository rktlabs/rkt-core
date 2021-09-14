'use strict'

export type OrderSide = 'bid' | 'ask'

export type OrderType = 'market'

export type OrderStatus = 'new' | 'partial' | 'filled' | 'liquidityStarved'

export type OrderState = 'open' | 'closed'

export type TLastTrade = {
    side: string
    price: number
    volume: number
    executedAt: string
}

export type TQuote = {
    assetId: string
    quoteAt: string
    bid: number
    ask: number
    lastTrade?: TLastTrade
}

export type TMarketOrderOpts = {
    assetId: string
    orderId: string
    portfolioId: string
    orderSide: OrderSide
    orderSize: number
    orderType?: OrderType
    tags?: any
    sizeRemaining?: number
}
