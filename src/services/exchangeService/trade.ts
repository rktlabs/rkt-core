'use strict'

import { DateTime } from 'luxon'
import { TakerFill } from './takerFill'
import { MakerFill } from './makerFill'
import { MarketOrder } from '.'
import { generateId } from '../..'

export class Trade {
    tradeId: string
    assetId: string
    executedAt: string
    taker: TakerFill
    makers: MakerFill[]

    constructor(takerOrder: MarketOrder) {
        this.assetId = takerOrder.assetId

        // construct TakerFill from Order
        const takerTradeFill = new TakerFill({
            assetId: takerOrder.assetId,
            orderId: takerOrder.orderId,
            portfolioId: takerOrder.portfolioId,
            orderType: takerOrder.orderType,
            orderSide: takerOrder.orderSide,
            orderSize: takerOrder.orderSize,
            sizeRemaining: takerOrder.sizeRemaining,
            tags: takerOrder.tags,
        })

        this.taker = takerTradeFill
        this.makers = []
        this.tradeId = `TRADE::${generateId()}`
        this.executedAt = DateTime.utc().toString()
    }

    fillMaker(makerFill: MakerFill, makerUnitDelta: number, makerCoinDelta: number): void {
        this.taker.fill(-1 * makerUnitDelta, -1 * makerCoinDelta) // taker gets flip side of maker

        makerFill.fill(makerUnitDelta, makerCoinDelta)
        this.makers.push(makerFill)
    }
}
