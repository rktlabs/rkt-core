'use strict'

import { TMakerParams } from './types'

export const bondingFunction = (x: number, params: TMakerParams) => {
    const limit = params.limit
    const a = params.a
    const k = params.k

    return limit / (1 + a * Math.E ** (-k * x))
}

export const inverseBondingFunction = (
    limit: number,
    currentPrice: number,
    madeUnits: number,
    coinPool: number,
): TMakerParams => {
    const magicConstant = 9.18482646743
    const k = (limit * magicConstant) / coinPool

    const a = (limit - currentPrice) / (currentPrice * Math.E ** (-k * madeUnits))

    const price0 = limit / (1 + a)

    const params = {
        price0: price0,

        limit: limit,
        a: a,
        k: k,
        coinPool: coinPool,
    }
    return params
}
