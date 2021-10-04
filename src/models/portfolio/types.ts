'use strict'

export type TPortfolio = {
    portfolioId: string
    createdAt: string
    type: string
    displayName: string
    ownerId: string
    tags?: any
    xids?: any

    deposits?: number
}

export type TPortfolioUpdate = {
    displayName?: string
    tags?: any
    xids?: any
    deposits?: any
}

export type TNewPortfolioConfig = {
    type?: string // supply type OR portfolioId. If portfolioId specified, type is overridden
    portfolioId?: string
    ownerId: string
    displayName?: string
    tags?: any
    xids?: any
}

export type TPortfolioDeposit = {
    createdAt: string
    portfolioId: string
    assetId: string
    units: number
}
