export type TNewAsset = {
    ownerId: string
    symbol: string
    displayName?: string

    contractId: string
    contractDisplayName?: string

    earnerId?: string
    earnerDisplayName?: string

    tags?: any
    xids?: any

    initialPrice?: number
}

export type TAssetCache = {
    assetId: string
    symbol: string
    type: string
    portfolioId?: string
    contractId: string
    cumulativeEarnings: number
}

export type TAsset = {
    createdAt: string
    type: string
    symbol: string
    assetId: string
    ownerId: string
    portfolioId?: string
    displayName: string

    contractId: string
    contractDisplayName: string

    earnerId?: string
    earnerDisplayName?: string

    tags?: any
    xids?: any

    cumulativeEarnings: number

    initialPrice?: number
    bid?: number
    ask?: number
    last?: number
}

export type TAssetUpdate = {
    bid?: number
    ask?: number
    last?: number
    cumulativeEarnings?: number
}

export type TAssetHolder = {
    assetId: string
    portfolioId: string
    units: number
}

export type TAssetHolderPatch = {
    units?: number
}
