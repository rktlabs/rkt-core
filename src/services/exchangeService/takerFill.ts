'use strict'

import { round4 } from '../..'
import { OrderSide, OrderType } from './types'

export type TakerFillEvent = {
    assetId: string
    orderId: string
    portfolioId: string
    orderSide: string
    orderSize: number
    orderType?: string
    tags?: any // eslint-disable-line
    sizeRemaining: number
    filledSize: number
    filledValue: number
    filledPrice: number
    isPartial: boolean
    isClosed: boolean
}

export class TakerFill {
    readonly assetId: string
    readonly orderSide: string
    readonly orderSize: number
    readonly orderId: string
    readonly portfolioId: string
    readonly orderType?: string
    readonly tags?: any // eslint-disable-line

    sizeRemaining: number

    filledSize: number
    filledValue: number
    filledPrice: number
    isPartial: boolean
    isClosed: boolean
    isLiquidityStarved: boolean

    constructor(opts: {
        assetId: string
        orderSide: OrderSide
        orderSize: number
        orderId: string
        orderType?: OrderType
        portfolioId: string
        sizeRemaining?: number
        tags?: any // eslint-disable-line
    }) {
        this.assetId = opts.assetId
        this.orderSide = opts.orderSide
        this.orderSize = Math.max(opts.orderSize, 0)
        this.tags = opts.tags
        this.sizeRemaining = opts.sizeRemaining === undefined ? opts.orderSize : opts.sizeRemaining

        if (opts.orderType) {
            this.orderType = opts.orderType
        }
        this.orderId = opts.orderId
        this.portfolioId = opts.portfolioId
        this.sizeRemaining = !opts.sizeRemaining ? opts.orderSize : opts.sizeRemaining
        this.tags = opts.tags

        this.filledSize = 0
        this.filledValue = 0
        this.filledPrice = 0
        this.isPartial = false
        this.isClosed = false
        this.isLiquidityStarved = false
    }

    reduceSizeRemaining(sizeReduction: number): number {
        const actualReduction: number = Math.min(sizeReduction, this.sizeRemaining)
        this.sizeRemaining -= actualReduction
        return actualReduction
    }

    fill(size: number, value: number): void {
        // filledSize should reflect signed size ( - for reduction)
        this.filledSize += size

        // value will be opposite direction of size (negative)
        this.filledValue += value

        this.filledPrice = this.filledSize === 0 ? 0 : Math.abs(round4(this.filledValue / this.filledSize))

        // reduce order size by absolute value
        this.reduceSizeRemaining(Math.abs(size))

        this.isClosed = this.sizeRemaining === 0
        this.isPartial = Math.abs(this.filledSize) < this.orderSize
    }
}
