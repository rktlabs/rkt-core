'use strict'

export type TNewUserConfig = {
    userId?: string
    dob: string
    email: string
    name: string
    username: string
    displayName?: string

    tags?: any
    initialCoins?: number
    referrerId?: string
}

export type TUser = {
    createdAt: string
    userId: string
    id: string // TEMP till consolidate on userId as Id

    dob: string
    email: string
    name: string
    username: string
    displayName?: string

    tags?: any

    portfolioId?: string
    isNew?: boolean
    referrerId?: string
}
