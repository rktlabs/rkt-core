'use strict'

import { MarketOrder, Trade } from '../../..'
import { TTakeResult, TNewMakerConfig } from './types'

export interface IMaker {
    computeMakerStateUpdate(stateUpdate: any): any

    processOrderUnits(takeSize: number): TTakeResult | null

    computeMakerInitialState(newMakerConfig: TNewMakerConfig): any

    processOrder(maker: IMaker, order: MarketOrder): Promise<Trade | null>
}
