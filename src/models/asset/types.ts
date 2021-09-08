export type TNewAsset = {
    ownerId: string
    symbol: string
    displayName?: string

    leagueId: string
    leagueDisplayName?: string

    tags?: any
    xids?: any

    // initialPrice?: number
}

export type TAsset = {
    createdAt: string
    type: string
    symbol: string
    assetId: string
    ownerId: string
    // portfolioId?: string
    displayName: string

    leagueId: string
    leagueDisplayName: string

    tags?: any
    xids?: any

    // initialPrice?: number
    bid?: number
    ask?: number
    last?: number
}

export type TAssetUpdate = {
    bid?: number
    ask?: number
    last?: number
}
