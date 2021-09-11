'use strict'
import { TTakeResult } from '../../types'
import { IMakerService } from '../IMakerService'

import { ParamUpdater } from './ParamUpdater'
import { TMakerParams } from './types'
import { MakerRepository, round4 } from '../../../..'
import { TNewMaker } from '../../../../models/maker'

export class KMakerService implements IMakerService {
    private makerRepository: MakerRepository
    private parmUpdater: ParamUpdater

    constructor() {
        this.makerRepository = new MakerRepository()
        this.parmUpdater = new ParamUpdater()
    }

    initializeParams(makerProps: TNewMaker) {
        const initMadeUnits = makerProps.settings?.initMadeUnits || 0
        const initPrice = makerProps.settings?.initPrice || 1
        const initialPoolUnits = makerProps.settings?.initialPoolUnits || 1000
        const poolUnits = initialPoolUnits - initMadeUnits
        const poolCoins = poolUnits * initPrice
        const k = poolUnits * poolCoins

        const params: TMakerParams = {
            poolUnits,
            poolCoins,
            k,
            x0: initialPoolUnits,
        }

        return { ...makerProps, params }
    }

    async takeUnits(makerId: string, takeSize: number): Promise<TTakeResult | null> {
        const maker = await this.makerRepository.getDetailAsync(makerId)
        if (!maker) {
            return null
        }
        const makerParams = maker.params as TMakerParams
        if (!makerParams) {
            return null
        }
        const { lastPrice: ask, propsUpdate } = this.computePrice(makerParams, takeSize)
        const { lastPrice: bid } = this.computePrice(makerParams, takeSize - 1)

        await this.parmUpdater.updateMakerParams(makerId, propsUpdate)

        return {
            bid: bid,
            ask: ask,
            last: bid,
            makerDeltaUnits: propsUpdate.poolUnitDelta,
            makerDeltaCoins: propsUpdate.poolCoinDelta,
        }
    }

    private computePrice(maker: TMakerParams, orderSize: number) {
        const initialPoolUnits = maker.poolUnits
        const initialPoolCoins = maker.poolCoins
        const k = maker.k

        let makerPoolUnitDelta = orderSize
        if (makerPoolUnitDelta < 0) {
            const makerSizeRemaining = (initialPoolUnits - 1) * -1 // NOTE: Can't take last unit
            makerPoolUnitDelta = Math.max(orderSize, makerSizeRemaining)
        }

        const newMakerPoolUnits = round4(initialPoolUnits - makerPoolUnitDelta)
        const newMakerPoolCoins = round4(k / newMakerPoolUnits) // maintain constant
        const makerPoolCoinDelta = round4(newMakerPoolCoins - initialPoolCoins)

        const lastPrice = round4(newMakerPoolCoins / newMakerPoolUnits)

        return {
            lastPrice: lastPrice,
            propsUpdate: {
                poolUnitDelta: makerPoolUnitDelta * -1,
                poolCoinDelta: makerPoolCoinDelta,
                kDelta: 0,
                madeUnitsDelta: makerPoolUnitDelta,
                currentPrice: lastPrice,
            },
        }
    }
}
