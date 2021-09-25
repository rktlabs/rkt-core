'use strict'

export type OperationType = 'order' | 'cancel'

export type OrderSide = 'bid' | 'ask'

export type OrderType = 'market' | 'limit'

export type OrderStatus = 'new' | 'partial' | 'filled' | 'liquidityStarved'

export type OrderState = 'open' | 'closed'

export type TOrderConfig = {
    assetId: string
    orderId: string
    portfolioId: string
    orderSide: OrderSide
    orderSize: number
    orderType?: OrderType
    tags?: any
    sizeRemaining?: number
}

export type TOrder = {
    assetId: string
    orderId: string
    portfolioId: string
    orderType: OrderType
    orderSide: OrderSide
    orderSize: number
    tags?: any
    sizeRemaining: number
    orderStatus: OrderStatus
    orderState: OrderState
}

export type TTaker = {
    orderId: string
    assetId: string
    orderSide: OrderSide
    orderSize: number
    portfolioId: string
    orderType?: OrderType
    tags?: any
    sizeRemaining: number
    filledSize: number
    filledValue: number
    filledPrice: number
    isPartial: boolean
    isClosed: boolean
    isLiquidityStarved: boolean
}

export type TMaker = {
    orderId?: string
    assetId: string
    orderSide: OrderSide
    orderSize: number
    portfolioId: string
    sizeRemaining: number
    filledSize: number
    filledValue: number
    filledPrice: number
    isPartial: boolean
    isClosed: boolean
}
