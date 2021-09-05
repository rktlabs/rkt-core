export type TNewPortfolio = {
    type?: string // supply type OR portfolioId. If portfolioId specified, type is overridden
    portfolioId?: string
    ownerId: string
    displayName?: string
    tags?: any
    xids?: any
}

export type TPortfolioAsset = {
    portfolioId: string
    assetId: string
    units: number

    displayName: string
    cost: number
    net: number
}

export type TPortfolioDeposit = {
    createdAt: string
    portfolioId: string
    assetId: string
    units: number
}

export type TPortfolioAssetUpdateItem = {
    portfolioId: string
    assetId: string
    deltaUnits: number
    deltaNet: number
    deltaCost: number
}

export type TPortfolioAssetCache = {
    portfolioId: string
    assetId: string
    units: number
}

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

export type TPortfolioPatch = {
    displayName?: string
    tags?: any
    xids?: any
    deposits?: any
}
