import { serialize, serializeCollection } from './exchangeQuoteSerializer'

export type TExchangeQuote = {
    assetId: string
    bid: number
    ask: number
    quoteAt: string
    lastTrade?: {
        executedAt: string
        price: number
        side: string
        volume: number
    }
}

export class ExchangeQuote {
    static serialize(req: any, data: any) {
        return serialize(req, data)
    }

    static serializeCollection(req: any, data: any) {
        return serializeCollection(req, data)
    }
}
