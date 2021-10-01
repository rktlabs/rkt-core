'use strict'

import { DateTime } from 'luxon'
import { TExchangeOrder } from '..'
import { TTaker, TMaker, OrderSide } from '.'
import { generateId, round4 } from '../../util'

export class ExchangeTrade {
    tradeId: string
    executedAt: string
    assetId: string
    taker: TTaker
    makers: TMaker[]
    createdAt?: string

    constructor(order: TExchangeOrder) {
        this.tradeId = `TRADE::${generateId()}`
        this.executedAt = DateTime.utc().toString()
        this.createdAt = DateTime.utc().toString()
        this.assetId = order.orderSource.assetId
        this.makers = []

        // construct Taker from Order
        const taker = this._generateTaker(order)

        this.taker = taker
    }

    supplyMakerSide(opts: {
        orderId?: string
        assetId: string
        orderSide: OrderSide
        orderSize: number
        portfolioId: string
        sizeRemaining?: number
        makerDeltaUnits: number
        makerDeltaValue: number
    }) {
        const maker: TMaker = {
            orderId: opts.orderId,
            assetId: opts.assetId,
            orderSide: opts.orderSide,
            orderSize: Math.max(opts.orderSize, 0),
            portfolioId: opts.portfolioId,
            sizeRemaining: !opts.sizeRemaining ? opts.orderSize : opts.sizeRemaining,
            filledSize: 0,
            filledValue: 0,
            filledPrice: 0,
            isPartial: false,
            isClosed: false,
        }

        this._fillMaker(maker, opts.makerDeltaUnits, opts.makerDeltaValue)

        return maker
    }
    //////////////////////////////////////////////
    // PRIVATE
    //////////////////////////////////////////////

    private _fillMaker(maker: TMaker, makerUnitDelta: number, makerCoinDelta: number): void {
        this._updateTakerFill(this.taker, -1 * makerUnitDelta, -1 * makerCoinDelta) // taker gets flip side of maker
        this._updateMakerFill(maker, makerUnitDelta, makerCoinDelta)
        this.makers.push(maker)
    }

    private _updateTakerFill(taker: TTaker, size: number, value: number): void {
        // filledSize should reflect signed size ( - for reduction)
        taker.filledSize += size

        // value will be opposite direction of size (negative)
        taker.filledValue += value

        taker.filledPrice = taker.filledSize === 0 ? 0 : Math.abs(round4(taker.filledValue / taker.filledSize))

        // reduce order size by absolute value
        const actualReduction: number = Math.min(Math.abs(size), taker.sizeRemaining)
        taker.sizeRemaining -= actualReduction

        taker.isClosed = taker.sizeRemaining === 0
        taker.isPartial = Math.abs(taker.filledSize) < taker.orderSize
    }

    private _updateMakerFill(maker: TMaker, size: number, value: number): void {
        // filledSize should reflect signed size ( - for reduction)
        maker.filledSize += size

        // value will be opposite direction of size (negative)
        maker.filledValue += value

        maker.filledPrice = maker.filledSize === 0 ? 0 : Math.abs(round4(maker.filledValue / maker.filledSize))

        // reduce order size by absolute value
        const actualReduction: number = Math.min(Math.abs(size), maker.sizeRemaining)
        maker.sizeRemaining -= actualReduction

        maker.isClosed = maker.sizeRemaining === 0
        maker.isPartial = Math.abs(maker.filledSize) < maker.orderSize
    }

    private _generateTaker(order: TExchangeOrder) {
        const taker: TTaker = {
            assetId: order.orderSource.assetId,
            orderSide: order.orderSource.orderSide,
            orderSize: Math.max(order.orderSource.orderSize, 0),
            tags: order.orderSource.tags,
            orderType: order.orderSource.orderType,
            orderId: order.orderId,
            portfolioId: order.orderSource.portfolioId,
            sizeRemaining: order.orderSource.orderSize,
            filledSize: 0,
            filledValue: 0,
            filledPrice: 0,
            isPartial: false,
            isClosed: false,
            isLiquidityStarved: false,
        }

        return taker
    }
}
