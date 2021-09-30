'use strict'

import { OrderType, OrderSide } from '../..'

export type TOrderSource = {
    // operation: OperationType // one of order, cancel
    sourceOrderId?: string

    // TODO: when receive order, look for nonce in existing set of orders. If exists, just
    // return that order. else process order
    // NOTE: portfolioId maps used to validate signature so order only valid for that portfolio
    portfolioId: string
    nonce?: string
    signature?: string // jws detached signature of this order - canonicalized and sig stripped

    assetId: string
    orderSide: OrderSide
    orderSize: number
    orderType: OrderType // market or limit
    orderPrice?: number
    tags?: any
    xids?: any
}

// export type TExchangeCancelOrder = {
//     // operation: OperationType
//     portfolioId: string
//     orderId: string
// }

// superset of TOrderSource
export type TExchangeOrder = {
    // operation: OperationType // one of order, cancel
    orderId: string

    portfolioId: string

    orderSource: TOrderSource

    sizeRemaining?: number
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
