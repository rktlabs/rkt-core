'use strict'

export type TActivity = {
    createdAt: string
    assetId: string
    portfolioId: string
    deltaUnits: number
    deltaValue: number
    transactionId: string
    source?: string
    refOrderId?: string
    refOrderPortfolioId?: string
    refTradeId?: string
}

export type TActivityUpdateItem = {
    assetId: string
    portfolioId: string
    deltaUnits: number
    deltaValue: number
}
