export type TNewMaker = {
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

    madeUnits: number

    currentPrice?: number

    params?: any
}

export type TMakerPatch = {
    currentPrice?: number

    params?: any
}
