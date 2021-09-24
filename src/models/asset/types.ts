'use strict'

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
    burnedUnits: number

    subject?: any

    tags?: any
    xids?: any

    quote?: any
}

export type TAssetCore = {
    assetId: string
    displayName: string
}

export type TAssetUpdate = {
    quote?: any
}

export type TAssetUpdate2 = {
    issuedUnits?: number
    burnedUnits?: number
}

export type TLeagueAssetDef = {
    symbol: string
    displayName: string
}
