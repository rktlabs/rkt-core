'use strict'
import { TMakerParams } from './types'

export const bondingFunction = (x: number, params: TMakerParams) => {
    const x0 = params.x0
    return x + x0 + 1
}

export const inverseBondingFunction = (currentPrice: number, madeUnits: number): TMakerParams => {
    const params = {
        //madeUnits: x,
        x0: currentPrice - 1 - madeUnits,
    }
    return params
}
