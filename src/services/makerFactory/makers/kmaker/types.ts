'use strict'

export type TMakerParamsUpdate = {
    poolUnitDelta: number
    poolCoinDelta: number
    kDelta: number

    madeUnitsDelta: number
    currentPrice: number
}

export type TMakerParams = {
    //madeUnits: number
    x0: number

    poolUnits: number
    poolCoins: number
    k: number
}
