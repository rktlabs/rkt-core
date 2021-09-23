'use strict'

export type TNewExchangeOrderConfig = {
    operation: string // one of order, cancel
    orderType: string // market or limit
    orderSide: string
    assetId: string
    portfolioId: string
    orderPrice?: number
    orderSize: number
    orderId: string
    tags?: any
    //refOrderId?: string
}

export type TExchangeCancelOrder = {
    operation: string
    assetId: string
    portfolioId: string
    orderId: string
    refOrderId: string
}

export type TExchangeOrder = {
    operation: string // one of order, cancel
    orderType: string
    orderSide: string
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
    //canceledAt?: string
    //canceledBy?: string
    refOrderId?: string
    closedAt?: string
    error?: string

    // reason?: string
    // executedAt?: string
    // filledPrice?: number
    // filledSize?: number
    // filledValue?: number
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
