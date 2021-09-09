export type TNewMaker = {
    ownerId: string
    symbol: string
    displayName?: string

    leagueId: string
    leagueDisplayName?: string

    tags?: any
    xids?: any

    // initialPrice?: number
}

export type TMaker = {
    createdAt: string
    type: string
    symbol: string
    makerId: string
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

export type TMakerUpdate = {
    bid?: number
    ask?: number
    last?: number
}
