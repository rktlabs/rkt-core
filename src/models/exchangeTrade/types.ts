'use strict'

export type OperationType = 'order' | 'cancel'

export type OrderSide = 'bid' | 'ask'

export type OrderType = 'market' | 'limit'

export type OrderStatus = 'new' | 'partial' | 'filled' | 'liquidityStarved'

export type OrderState = 'open' | 'closed'

export type TTaker = {
    assetId: string
    filledPrice: number
    filledSize: number
    filledValue: number
    isClosed: boolean
    isLiquidityStarved: boolean
    isPartial: boolean
    orderSide: OrderSide
    orderSize: number
    portfolioId: string
    sizeRemaining: number

    orderId: string
    orderType?: OrderType
    tags?: any
}

export type TMaker = {
    orderId?: string
    assetId: string
    filledPrice: number
    filledSize: number
    filledValue: number
    isClosed: boolean
    isPartial: boolean
    orderSide: OrderSide
    orderSize: number
    portfolioId: string
    sizeRemaining: number
}

export type TExchangeTrade = {
    tradeId: string
    assetId: string
    executedAt: string
    taker: TTaker
    makers: TMaker[]

    createdAt?: string
}
