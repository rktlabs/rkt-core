export type TNewAsset = {
    ownerId: string
    symbol: string
    displayName?: string

    leagueId: string
    leagueDisplayName?: string

    // earnerId?: string
    // earnerDisplayName?: string

    tags?: any
    // xids?: any

    initialPrice?: number
}

// export type TAssetCache = {
//     assetId: string
//     symbol: string
//     type: string
//     portfolioId?: string
//     leagueId: string
//     // cumulativeEarnings: number
// }

export type TAsset = {
    createdAt: string
    type: string
    symbol: string
    assetId: string
    ownerId: string
    portfolioId?: string
    displayName: string

    leagueId: string
    leagueDisplayName: string

    // earnerId?: string
    // earnerDisplayName?: string

    tags?: any
    // xids?: any

    // cumulativeEarnings: number

    initialPrice?: number
    bid?: number
    ask?: number
    last?: number
}

export type TAssetUpdate = {
    bid?: number
    ask?: number
    last?: number
    // cumulativeEarnings?: number
}
