'use strict'

import { DateTime } from 'luxon'
import { OrderSide, OrderType, TTaker, TMaker, TOrder } from '../..'
import { generateId, round4 } from '../../..'

export class Trade {
    tradeId: string
    executedAt: string
    assetId: string
    taker: TTaker
    makers: TMaker[]

    constructor(order: TOrder) {
        this.tradeId = `TRADE::${generateId()}`
        this.executedAt = DateTime.utc().toString()
        this.assetId = order.assetId
        this.makers = []

        // construct Taker from Order
        const taker = this.generateTaker({
            assetId: order.assetId,
            orderId: order.orderId,
            portfolioId: order.portfolioId,
            orderType: order.orderType,
            orderSide: order.orderSide,
            orderSize: order.orderSize,
            tags: order.tags,
            sizeRemaining: order.sizeRemaining,
        })

        this.taker = taker
    }

    supplyMakerSide(opts: {
        assetId: string
        orderSide: OrderSide
        orderSize: number
        portfolioId: string
        sizeRemaining?: number
        makerDeltaUnits: number
        makerDeltaValue: number
    }) {
        const maker: TMaker = {
            assetId: opts.assetId,
            orderSide: opts.orderSide,
            orderSize: Math.max(opts.orderSize, 0),
            portfolioId: opts.portfolioId,
            sizeRemaining: !opts.sizeRemaining ? opts.orderSize : opts.sizeRemaining,
            filledSize: 0,
            filledValue: 0,
            filledPrice: 0,
            // isPartial: false,
            isClosed: false,
        }

        this.fillMaker(maker, opts.makerDeltaUnits, opts.makerDeltaValue)

        return maker
    }

    //////////////////////////////////////////////
    // PRIVATE
    //////////////////////////////////////////////

    private fillMaker(maker: TMaker, makerUnitDelta: number, makerCoinDelta: number): void {
        this.updateTakerFill(this.taker, -1 * makerUnitDelta, -1 * makerCoinDelta) // taker gets flip side of maker
        this.updateMakerFill(maker, makerUnitDelta, makerCoinDelta)
        this.makers.push(maker)
    }

    private updateTakerFill(taker: TTaker, size: number, value: number): void {
        // filledSize should reflect signed size ( - for reduction)
        taker.filledSize += size

        // value will be opposite direction of size (negative)
        taker.filledValue += value

        taker.filledPrice = taker.filledSize === 0 ? 0 : Math.abs(round4(taker.filledValue / taker.filledSize))

        // reduce order size by absolute value
        const actualReduction: number = Math.min(Math.abs(size), taker.sizeRemaining)
        taker.sizeRemaining -= actualReduction

        taker.isClosed = taker.sizeRemaining === 0
        // taker.isPartial = Math.abs(taker.filledSize) < taker.orderSize
    }

    private updateMakerFill(maker: TMaker, size: number, value: number): void {
        // filledSize should reflect signed size ( - for reduction)
        maker.filledSize += size

        // value will be opposite direction of size (negative)
        maker.filledValue += value

        maker.filledPrice = maker.filledSize === 0 ? 0 : Math.abs(round4(maker.filledValue / maker.filledSize))

        // reduce order size by absolute value
        const actualReduction: number = Math.min(Math.abs(size), maker.sizeRemaining)
        maker.sizeRemaining -= actualReduction

        maker.isClosed = maker.sizeRemaining === 0
        // maker.isPartial = Math.abs(maker.filledSize) < maker.orderSize
    }

    private generateTaker(opts: {
        assetId: string
        orderSide: OrderSide
        orderSize: number
        orderId: string
        orderType?: OrderType
        portfolioId: string
        sizeRemaining?: number
        tags?: any // eslint-disable-line
    }) {
        const taker: TTaker = {
            assetId: opts.assetId,
            orderSide: opts.orderSide,
            orderSize: Math.max(opts.orderSize, 0),
            tags: opts.tags,
            orderType: opts.orderType,
            orderId: opts.orderId,
            portfolioId: opts.portfolioId,
            sizeRemaining: !opts.sizeRemaining ? opts.orderSize : opts.sizeRemaining,
            filledSize: 0,
            filledValue: 0,
            filledPrice: 0,
            // isPartial: false,
            isClosed: false,
            // isLiquidityStarved: false,
        }

        return taker
    }
}
