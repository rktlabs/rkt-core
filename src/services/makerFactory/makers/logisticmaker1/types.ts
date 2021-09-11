'use strict'

export type TMakerParamsUpdate = {
    madeUnitsDelta: number
    currentPrice: number
}

export type TMakerParams = {
    price0: number
    coinPool: number

    limit: number
    a: number
    k: number
}
