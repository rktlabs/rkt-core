'use strict'

import { TOrderSource } from '../..'

export type TPortfolioOrder = {
    orderId: string
    orderSource: TOrderSource

    filledPrice?: number
    filledSize?: number
    filledValue?: number
    sizeRemaining?: number

    orderStatus: string
    orderState: string

    createdAt: string
    closedAt?: string
    executedAt?: string
    reason?: string

    events: any[]
}

export type TPortfolioOrderPatch = {
    filledPrice?: number
    filledSize?: number
    filledValue?: number
    sizeRemaining?: number
    orderStatus?: string
    orderState?: string
    closedAt?: string
    executedAt?: string // TODO: Populate this?
    reason?: string
}
