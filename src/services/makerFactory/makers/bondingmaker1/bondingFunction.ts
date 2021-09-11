'use strict'

import { TMakerParams } from './types'

export const bondingFunction = (x: number, params: TMakerParams) => {
    // return x + 1
    // return 1.05 ** x
    const x0 = params.x0
    return x + x0 === 0 ? 1 : 1 + (x + x0) ** (1 / 2)
}

export const inverseBondingFunction = (currentPrice: number, madeUnits: number): TMakerParams => {
    // return y - 1
    // return y ** (1/1.05)
    const params = {
        x0: (currentPrice - 1) ** 2 - madeUnits,
    }
    return params
}
