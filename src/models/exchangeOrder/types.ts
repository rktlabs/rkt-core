'use strict'

import { OrderType, OrderSide, OperationType } from '../..'

export type TNewExchangeOrderConfig = {
    operation: OperationType // one of order, cancel
    portfolioId: string
    orderId: string

    assetId: string
    orderType: OrderType // market or limit
    orderSide: OrderSide
    orderSize: number
    orderPrice?: number
    sizeRemaining?: number
    tags?: any
}

export type TExchangeCancelOrder = {
    operation: OperationType
    portfolioId: string
    orderId: string
}

// superset of TNewExchangeOrderConfig
export type TExchangeOrder = {
    operation: OperationType // one of order, cancel
    portfolioId: string
    orderId: string

    assetId: string
    orderType: OrderType
    orderSide: OrderSide
    orderSize: number
    orderPrice?: number
    sizeRemaining?: number
    tags?: any
    events: any[]

    orderStatus: string
    orderState: string

    createdAt: string
    closedAt?: string
    reason?: string

    filledPrice?: number
    filledSize?: number
    filledValue?: number

    executedAt?: string
}

export type TExchangeOrderPatch = {
    closedAt?: string
    filledPrice?: number
    filledSize?: number
    filledValue?: number
    sizeRemaining?: number
    orderStatus?: string
    orderState?: string
    reason?: string
    executedAt?: string
}

//////////////////////////////////////////////////
// Order Events - captured as trades completed and logged in events[] collection

export type TExchangeOrderFill = {
    orderId: string
    portfolioId: string
    eventType: string
    publishedAt: string
    filledSize: number
    filledValue: number
    filledPrice: number
    sizeRemaining: number
    tradeId: string
}

export type TExchangeOrderComplete = {
    orderId: string
    portfolioId: string
    eventType: string
    publishedAt: string
}

export type TExchangeOrderFailed = {
    orderId: string
    portfolioId: string
    eventType: string
    publishedAt: string
    reason: string
}
