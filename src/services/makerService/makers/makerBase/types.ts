export type TNewMakerConfig = {
    type: string
    ownerId: string
    assetId: string
    settings?: any
    params?: any
}

export type TMaker = {
    createdAt: string
    portfolioId?: string
    type: string
    ownerId: string
    assetId: string
    params?: any

    currentPrice?: number
}

export type TMakerPatch = {
    params?: any

    currentPrice?: number
}

export type TTakeResult = {
    // bid: number
    // ask: number
    // last: number
    makerDeltaUnits: number
    makerDeltaCoins: number
    statusUpdate: any
}
