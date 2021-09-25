'use strict'

import { OrderSide, OrderType } from '../..'

export type TTakerFill = {
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

export type TMakerFill = {
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
    taker: TTakerFill
    makers: TMakerFill[]

    createdAt?: string
}
