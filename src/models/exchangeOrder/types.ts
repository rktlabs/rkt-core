'use strict'

import { OrderType, OrderSide, OperationType } from '../..'

export type TNewExchangeOrderConfig = {
    operation: OperationType // one of order, cancel
    orderType: OrderType // market or limit
    orderSide: OrderSide
    assetId: string
    portfolioId: string
    orderPrice?: number
    orderSize: number
    orderId: string
    tags?: any
}

export type TExchangeCancelOrder = {
    operation: OperationType
    portfolioId: string
    orderId: string
}

export type TExchangeOrder = {
    operation: OperationType // one of order, cancel
    orderType: OrderType
    orderSide: OrderSide
    assetId: string
    portfolioId: string
    orderPrice?: number
    orderSize: number
    orderId: string
    tags?: any

    createdAt: string
    status: string
    state: string
    sizeRemaining?: number
    closedAt?: string
    reason?: string

    filledPrice?: number
    filledSize?: number
    filledValue?: number

    executedAt?: string
}

export type TExchangeOrderPatch = {
    status?: string
    state?: string
    closedAt?: string
    executedAt?: string
    reason?: string
    sizeRemaining?: number
    filledPrice?: number
    filledSize?: number
    filledValue?: number
}
