'use strict'

import { OrderType, OrderSide, OrderStatus, OrderState, TMarketOrderOpts } from './types'

export class MarketOrder {
    readonly assetId: string
    readonly orderId: string
    readonly portfolioId: string
    readonly orderType: OrderType
    readonly orderSide: OrderSide
    readonly orderSize: number
    readonly tags?: any // eslint-disable-line

    #sizeRemaining: number

    orderStatus: OrderStatus
    orderState: OrderState

    get sizeRemaining(): number {
        return this.#sizeRemaining
    }

    constructor(opts: TMarketOrderOpts) {
        // eslint-disable-line
        this.assetId = opts.assetId
        this.orderId = opts.orderId
        this.portfolioId = opts.portfolioId
        this.orderSide = opts.orderSide
        this.orderSize = Math.max(opts.orderSize, 0)
        this.tags = opts.tags

        this.orderType = opts.orderType ? opts.orderType : 'market'
        this.#sizeRemaining = opts.sizeRemaining === undefined ? opts.orderSize : opts.sizeRemaining

        this.orderStatus = 'new'
        this.orderState = 'open'
    }

    reduceSizeRemaining(sizeReduction: number): number {
        const actualReduction: number = Math.min(sizeReduction, this.#sizeRemaining)
        this.#sizeRemaining -= actualReduction
        return actualReduction
    }
}
