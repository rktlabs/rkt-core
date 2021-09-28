'use strict'

import { OrderSide, OrderType } from '../..'

export type TNewPortfolioOrderProps = {
    assetId: string
    orderSide: OrderSide
    orderSize: number
    orderType: OrderType // market or limit
    orderPrice?: number
    tags?: any
    xids?: any
}

export type TPortfolioOrder = {
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

export type TPortfolioOrderPatch = {
    closedAt?: string
    filledPrice?: number
    filledSize?: number
    filledValue?: number
    sizeRemaining?: number
    orderStatus?: string
    orderState?: string
    reason?: string
    executedAt?: string // TODO: Populate this?
}
