// export type TLeagueEarnerDef = {
//     earnerId: string
//     initialPrice: number
//     displayName: string
// }

export type TNewLeague = {
    leagueId: string
    ownerId: string
    displayName?: string
    description?: string
    // startAt?: string
    // endAt?: string
    // acceptEarningsAfter?: string
    // ignoreEarningsAfter?: string
    // key?: string
    // pt?: number
    tags?: any
    // earnerList?: TLeagueEarnerDef[]
}

export type TLeague = {
    createdAt: string
    leagueId: string
    ownerId: string
    portfolioId: string
    displayName: string
    description: string
    // startAt?: string
    // endAt?: string
    // acceptEarningsAfter?: string
    // ignoreEarningsAfter?: string
    // key?: string
    // pt?: number
    tags?: any
    //playerList?: TLeagueAssetDef[]
    managedAssets: string[]
    // currencyId: string
    // currencySource: string
}

export type TLeagueUpdate = {
    managedAssets: string[]
}
