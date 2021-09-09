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
