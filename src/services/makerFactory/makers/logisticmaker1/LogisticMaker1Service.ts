'use strict'
import { IMakerService } from '../IMakerService'

import { ParamUpdater } from './ParamUpdater'
import { TMakerParams, TMakerParamsUpdate } from './types'
import { bondingFunction, inverseBondingFunction } from './bondingFunction'
import { MakerRepository, round4, TTakeResult } from '../../../..'
import { TNewMaker } from '../../../../models/maker'

export class LogisticMaker1Service implements IMakerService {
    private makerRepository: MakerRepository
    private parmUpdater: ParamUpdater
    private bondingFunction: (x: number, constants: any) => number

    constructor() {
        this.makerRepository = new MakerRepository()
        this.parmUpdater = new ParamUpdater()

        this.bondingFunction = bondingFunction
    }

    initializeParams(makerProps: TNewMaker) {
        const initMadeUnits = makerProps.settings?.initMadeUnits || 0
        const initPrice = makerProps.settings?.initPrice || 1
        if (!makerProps.settings?.limit) {
            throw new Error('No limit specified for maker')
        }
        const limit = makerProps.settings?.limit || 1000
        const coinPool = makerProps.settings?.coinPool || 100 * 1000
        const params = inverseBondingFunction(limit, initPrice, initMadeUnits, coinPool)
        return { ...makerProps, params }
    }

    async takeUnits(makerId: string, takeSize: number): Promise<TTakeResult | null> {
        // TODO TODO Do this in transaction

        const maker = await this.makerRepository.getDetailAsync(makerId)
        if (!maker) {
            return null
        }
        const makerParams = maker.params as TMakerParams
        if (!makerParams) {
            return null
        }

        const madeUnits = maker.madeUnits

        let makerDeltaUnits = 0
        let makerDeltaCoins = 0
        let coins = 0

        if (takeSize > 0) {
            // for bid (a buy) so maker units is negative, maker coins is positive
            for (let x = madeUnits; x < madeUnits + takeSize; ++x) {
                coins += this.bondingFunction(x, makerParams)
            }

            makerDeltaUnits = takeSize * -1
            makerDeltaCoins = round4(coins)
        } else {
            const limitedTakeSize = Math.max(takeSize, madeUnits * -1) // is negative
            // ask (sell) maker units is positive, maker coins is negative
            for (let x = madeUnits - 1; x >= madeUnits + limitedTakeSize; --x) {
                coins += this.bondingFunction(x, makerParams)
            }

            makerDeltaUnits = limitedTakeSize * -1 // will be positive
            makerDeltaCoins = round4(coins) * -1
        }

        // last price adjusted based on taker quantity
        const bid = this.bondingFunction(maker.madeUnits - makerDeltaUnits - 1, makerParams)
        const ask = this.bondingFunction(maker.madeUnits - makerDeltaUnits - 0, makerParams)
        const last = bid

        const propsUpdate: TMakerParamsUpdate = {
            madeUnitsDelta: makerDeltaUnits * -1,
            currentPrice: ask,
        }

        await this.parmUpdater.updateMakerParams(makerId, propsUpdate)

        return {
            bid: bid,
            ask: ask,
            last: last,
            makerDeltaUnits: makerDeltaUnits,
            makerDeltaCoins: makerDeltaCoins,
        }
    }
}
