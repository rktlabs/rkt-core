'use strict'

import { DateTime } from 'luxon'
import { round4 } from '../../../..'
import { MakerBase } from '../makerBase/entity'
import { TNewMakerConfig, TMaker, TTakeResult } from '../makerBase/types'
import admin = require('firebase-admin')
const FieldValue = admin.firestore.FieldValue

type TKMakerParamsUpdate = {
    madeUnitsDelta: number
    currentPrice: number

    poolUnitDelta: number
    poolCoinDelta: number
    kDelta: number
}

type TKMakerParams = {
    madeUnits: number
    x0: number

    poolUnits: number
    poolCoins: number
    k: number
}

export class KMaker extends MakerBase {
    static newMaker(props: TNewMakerConfig) {
        const createdAt = DateTime.utc().toString()
        const type = props.type
        const assetId = props.assetId

        const makerProps: TMaker = {
            createdAt,
            type,
            assetId,
            ownerId: props.ownerId,

            currentPrice: props.settings?.initPrice,
        }

        const newEntity = new KMaker(makerProps)
        newEntity.params = newEntity.computeInitialState(props)

        return newEntity
    }

    constructor(props: TMaker) {
        super(props)
    }

    computeInitialState(newMakerConfig: TNewMakerConfig) {
        const initMadeUnits = newMakerConfig.settings?.initMadeUnits || 0
        const initPrice = newMakerConfig.settings?.initPrice || 1
        const initialPoolUnits = newMakerConfig.settings?.initialPoolUnits || 1000
        const poolUnits = initialPoolUnits - initMadeUnits
        const poolCoins = poolUnits * initPrice
        const k = poolUnits * poolCoins

        const makerState: TKMakerParams = {
            madeUnits: initMadeUnits,
            poolUnits,
            poolCoins,
            k,
            x0: initialPoolUnits,
        }

        return makerState
    }

    computeStateUpdate(stateUpdate: TKMakerParamsUpdate) {
        const data = {
            ['params.poolCoins']: FieldValue.increment(stateUpdate.poolCoinDelta),
            ['params.poolUnits']: FieldValue.increment(stateUpdate.poolUnitDelta),
            ['params.k']: FieldValue.increment(stateUpdate.kDelta),
            ['madeUnits']: FieldValue.increment(stateUpdate.madeUnitsDelta),
            ['currentPrice']: stateUpdate.currentPrice,
        }
        return data
    }

    async processOrderImpl(orderSide: string, orderSize: number) {
        ////////////////////////////////////////////////////////
        // Process the order
        ////////////////////////////////////////////////////////

        // for bid (a buy) I'm "removing" units from the pool, so flip sign
        const signedOrderSize = orderSide === 'ask' ? orderSize * -1 : orderSize
        const taken = this.processOrderUnits(signedOrderSize)
        if (taken) {
            const data = taken.statusUpdate
            await this.makerRepository.updateMakerStateAsync(this.assetId, data)

            const { makerDeltaUnits, makerDeltaCoins } = taken

            return { makerDeltaUnits, makerDeltaCoins }
        } else {
            return null
        }
    }

    ////////////////////////////////////////////////////////
    // PRIVATE
    ////////////////////////////////////////////////////////

    private processOrderUnits(takeSize: number): TTakeResult | null {
        const makerParams = this.params as TKMakerParams
        if (!makerParams) {
            return null
        }
        const { propsUpdate } = this.computePrice(makerParams, takeSize)

        const statusUpdate = this.computeStateUpdate(propsUpdate)

        return {
            makerDeltaUnits: propsUpdate.poolUnitDelta,
            makerDeltaCoins: propsUpdate.poolCoinDelta,
            statusUpdate: statusUpdate,
        }
    }

    private computePrice(maker: TKMakerParams, orderSize: number) {
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
            // lastPrice: lastPrice,
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
