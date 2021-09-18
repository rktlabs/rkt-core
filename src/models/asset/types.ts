export type TNewAssetConfig = {
    ownerId: string
    symbol: string
    displayName?: string

    leagueId?: string
    leagueDisplayName?: string

    subject?: any
    tags?: any
    xids?: any
}

export type TAsset = {
    createdAt: string
    type: string
    symbol: string
    assetId: string
    ownerId: string
    portfolioId?: string
    displayName: string

    leagueId?: string
    leagueDisplayName?: string

    issuedUnits: number

    subject?: any

    tags?: any
    xids?: any

    bid?: number
    ask?: number
    last?: number
}

export type TAssetCore = {
    assetId: string
    displayName: string
}

export type TAssetUpdate = {
    bid?: number
    ask?: number
    last?: number
}

export type TLeagueAssetDef = {
    symbol: string
    displayName: string
}
