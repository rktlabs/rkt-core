'use strict'

import { TMarketMaker } from './types'

// MarketMaker holds value and shares to be sold.
export abstract class MarketMaker {
    createdAt: string
    type: string
    ownerId: string
    assetId: string
    portfolioId?: string
    tags?: any
    params?: any
    quote?: any

    constructor(props: TMarketMaker) {
        this.createdAt = props.createdAt
        this.type = props.type
        this.assetId = props.assetId
        this.ownerId = props.ownerId
        this.portfolioId = props.portfolioId
        this.tags = props.tags
        this.params = props.params
        this.quote = props.quote
    }
}
