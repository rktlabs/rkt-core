import { TAssetCore } from '..'

export type TNewLeague = {
    leagueId: string
    ownerId: string
    displayName?: string
    description?: string
    tags?: any
}

export type TLeague = {
    createdAt: string
    leagueId: string
    ownerId: string
    portfolioId: string
    displayName: string
    description: string
    tags?: any
    managedAssets: TAssetCore[]
}

export type TLeagueUpdate = {
    managedAssets: string[]
}
