'use strict'

import { round4 } from '../..'
import { OrderSide } from './types'

export class MakerFill {
    readonly assetId: string
    readonly orderSide: string
    readonly orderSize: number
    readonly portfolioId: string

    sizeRemaining: number

    filledSize: number
    filledValue: number
    filledPrice: number
    isPartial: boolean
    isClosed: boolean

    constructor(opts: {
        assetId: string
        orderSide: OrderSide
        orderSize: number
        portfolioId: string
        sizeRemaining?: number
    }) {
        this.assetId = opts.assetId
        this.orderSide = opts.orderSide
        this.orderSize = Math.max(opts.orderSize, 0)
        this.sizeRemaining = opts.sizeRemaining === undefined ? opts.orderSize : opts.sizeRemaining
        this.portfolioId = opts.portfolioId

        this.sizeRemaining = !opts.sizeRemaining ? opts.orderSize : opts.sizeRemaining

        this.filledSize = 0
        this.filledValue = 0
        this.filledPrice = 0
        this.isPartial = false
        this.isClosed = false
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
