'use strict'

import { TMarketMakerQuote } from '../..'

export type TExchangeQuote = {
    assetId: string
} & TMarketMakerQuote
