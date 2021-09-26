'use strict'

import { OrderSide, OrderType } from '../..'

export type TNewPortfolioOrderProps = {
    //orderId?: string
    //portfolioId: string
    assetId: string
    orderSide: OrderSide
    orderSize: number
    orderType: OrderType // market or limit
    orderPrice?: number
    tags?: any
    xids?: any
}

export type TPortfolioOrder = {
    createdAt: string
    orderId: string
    //portfolioId: string
    assetId: string
    orderSide: OrderSide
    orderSize: number
    status: string
    state: string
    orderType: OrderType
    reason?: string

    orderPrice?: number
    events: any[]
    tags?: any
    xids?: any
    closedAt?: string
    filledPrice?: number
    filledSize?: number
    filledValue?: number
    sizeRemaining?: number
}

export type TPortfolioOrderPatch = {
    closedAt?: string
    filledPrice?: number
    filledSize?: number
    filledValue?: number
    sizeRemaining?: number
    status?: string
    state?: string
    reason?: string
}

export type TPortfolioOrderEvent = {
    orderId: string
    portfolioId: string
    eventType: string
    publishedAt: string
}

export type TPortfolioOrderFill = TPortfolioOrderEvent & {
    filledSize: number
    filledValue: number
    filledPrice: number
    sizeRemaining: number
    tradeId: string
}

export type TPortfolioOrderComplete = TPortfolioOrderEvent

export type TPortfolioOrderFailed = TPortfolioOrderEvent & {
    reason: string
}
