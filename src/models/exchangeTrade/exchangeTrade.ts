// import { serialize, serializeCollection } from './exchangeTradeSerializer'

export type TTakerFill = {
    assetId: string
    filledPrice: number
    filledSize: number
    filledValue: number
    isClosed: boolean
    isLiquidityStarved: boolean
    isPartial: boolean
    orderSide: string
    orderSize: number
    portfolioId: string
    sizeRemaining: number

    orderId: string
    orderType?: string
    tags?: any
}

export type TMakerFill = {
    assetId: string
    filledPrice: number
    filledSize: number
    filledValue: number
    isClosed: boolean
    isPartial: boolean
    orderSide: string
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

// export class ExchangeTrade {
//     static serialize(req: any, data: any) {
//         return serialize(req, data)
//     }

//     static serializeCollection(req: any, data: any) {
//         return serializeCollection(req, data)
//     }
// }
