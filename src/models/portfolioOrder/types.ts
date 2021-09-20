export type TNewOrderProps = {
    orderId?: string
    assetId: string
    portfolioId: string
    orderSide: string
    orderSize: number
    orderType: string // market or limit
    orderPrice?: number
    tags?: any
    xids?: any
}

// a data item that is stored on the order in the events[] collection.
export type TOrderEvent = {
    notificationType: string
    publishedAt: string
    nonce: string
    attributes?: any
    messageId?: string
}

export type TOrder = {
    createdAt: string
    orderId: string
    assetId: string
    portfolioId: string
    orderSide: string
    orderSize: number
    status: string
    state: string
    orderType: string
    reason?: string

    orderPrice?: number
    events: TOrderEvent[]
    tags?: any
    xids?: any
    closedAt?: string
    filledPrice?: number
    filledSize?: number
    filledValue?: number
    sizeRemaining?: number
}

export type TOrderPatch = {
    closedAt?: string
    events?: TOrderEvent[]
    filledPrice?: number
    filledSize?: number
    filledValue?: number
    status?: string
    state?: string
}
