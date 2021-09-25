'use strict'

import { Trade, TOrder, TMakerResult, TMarketMaker, OrderSide } from '../..'

export interface IMarketMaker extends TMarketMaker {
    processOrder(order: TOrder): Promise<Trade | null>

    processOrderImpl(orderSide: OrderSide, orderSize: number): Promise<TMakerResult | null>

    flattenMaker(): void
}
