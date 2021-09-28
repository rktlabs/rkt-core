'use strict'

export type TExchangeQuoteLast = {
    side: string
    units: number
    value: number
    unitValue: number
}

export type TExchangeQuote = {
    assetId: string
    last?: TExchangeQuoteLast
    spot: number
    bid: number
    ask: number
    bid10: number
    ask10: number
}
