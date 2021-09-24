'use strict'

// note: same structure as market maker quote
export type TExchangeQuote = {
    assetId: string
    last?: {
        side: string
        units: number
        value: number
        unitValue: number
    }
    current: number
    bid1: number
    ask1: number
    bid10: number
    ask10: number
}
