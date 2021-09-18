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

export type TPortfolioHolding = {
    portfolioId: string
    assetId: string
    units: number

    displayName: string
    cost: number
    net: number
}

export type TAssetHolderUpdateItem = {
    assetId: string
    portfolioId: string
    deltaUnits: number
    // deltaNet: number
    // deltaCost: number
}

export type TPortfolioDeposit = {
    createdAt: string
    portfolioId: string
    assetId: string
    units: number
}
