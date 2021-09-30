'use strict'

import { TExchangeQuote } from '..'

export type TNewMarketMakerConfig = {
    type: string
    ownerId: string
    assetId: string
    settings?: any
    tags?: any
    params?: any
}

export type TMarketMaker = {
    createdAt: string
    portfolioId?: string
    type: string
    ownerId: string
    assetId: string
    tags?: any
    params?: any
    quote?: TExchangeQuote
}
