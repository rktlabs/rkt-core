'use strict'

import { DateTime } from 'luxon'
import { MakerBase } from '../makerBase/entity'
import { TNewMakerConfig, TMaker, TTakeResult } from '../makerBase/types'
import { MintService } from '../../..'
import { AssetHolderRepository, NotFoundError, round4 } from '../../../..'
import admin = require('firebase-admin')
const FieldValue = admin.firestore.FieldValue

type TBonding2MakerParamsUpdate = {
    madeUnitsDelta: number
    currentPrice: number
}

type TBonding2MakerParams = {
    madeUnits: number
    x0: number
}

const bondingFunction = (x: number, params: TBonding2MakerParams) => {
    const x0 = params.x0
    return x + x0 + 1
}

const inverseBondingFunction = (currentPrice: number, madeUnits: number): TBonding2MakerParams => {
    const params = {
        madeUnits: madeUnits,
        x0: currentPrice - 1 - madeUnits,
    }
    return params
}

export class Bonding2Maker extends MakerBase {
    private assetHolderRepository: AssetHolderRepository
    private mintService: MintService

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

        const newEntity = new Bonding2Maker(makerProps)
        newEntity.params = newEntity.computeInitialState(props)

        return newEntity
    }

    constructor(props: TMaker) {
        super(props)
        this.assetHolderRepository = new AssetHolderRepository()
        this.mintService = new MintService()
    }

    computeInitialState(newMakerConfig: TNewMakerConfig) {
        const initMadeUnits = newMakerConfig.settings?.initMadeUnits || 0
        const initPrice = newMakerConfig.settings?.initPrice || 1
        const makerState = inverseBondingFunction(initPrice, initMadeUnits)
        return makerState
    }

    computeStateUpdate(stateUpdate: TBonding2MakerParamsUpdate) {
        const data = {
            ['params.madeUnits']: FieldValue.increment(stateUpdate.madeUnitsDelta),
            currentPrice: stateUpdate.currentPrice,
        }
        return data
    }

    async processOrderImpl(orderSide: string, orderSize: number) {
        ////////////////////////////
        // verify that asset exists
        ////////////////////////////
        const asset = await this.resolveAssetSpec(this.assetId)

        ////////////////////////////////////////////////////////
        // Process the order
        ////////////////////////////////////////////////////////
        // TODO: There is an assumption that the maker portfolio is the asset. That would,
        // actually, be up to the maker, yes?
        const assetPortfolioId = asset.portfolioId
        if (!assetPortfolioId) {
            const msg = `Invalid Order: Asset Portfolio: not configured`
            throw new NotFoundError(msg)
        }

        if (orderSide == 'bid' && orderSize > 0) {
            // test that asset has enough units to transact
            const assetPortfolioHoldings = await this.assetHolderRepository.getDetailAsync(
                this.assetId,
                assetPortfolioId,
            )
            const portfolioHoldingUnits = round4(assetPortfolioHoldings?.units || 0)
            if (portfolioHoldingUnits < orderSize) {
                const delta = orderSize - portfolioHoldingUnits
                // not enough. mint me sonme
                await this.mintService.mintUnits(this.assetId, delta)
            }
        }

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
        const makerParams = this.params as TBonding2MakerParams
        if (!makerParams) {
            return null
        }

        const madeUnits = this.params.madeUnits

        let makerDeltaUnits = 0
        let makerDeltaCoins = 0
        let coins = 0

        if (takeSize > 0) {
            // for bid (a buy) so maker units is negative, maker coins is positive
            for (let x = madeUnits; x < madeUnits + takeSize; ++x) {
                coins += bondingFunction(x, makerParams)
            }

            makerDeltaUnits = takeSize * -1
            makerDeltaCoins = round4(coins)
        } else {
            const limitedTakeSize = Math.max(takeSize, madeUnits * -1)
            // ask (sell) maker units is positive, maker coins is negative
            for (let x = madeUnits - 1; x >= madeUnits + limitedTakeSize; --x) {
                coins += bondingFunction(x, makerParams)
            }

            makerDeltaUnits = limitedTakeSize * -1
            makerDeltaCoins = round4(coins) * -1
        }

        // last price adjusted based on taker quantity
        const ask = bondingFunction(this.params.madeUnits - makerDeltaUnits - 0, makerParams)

        const propsUpdate: TBonding2MakerParamsUpdate = {
            madeUnitsDelta: makerDeltaUnits * -1,
            currentPrice: ask,
        }

        const statusUpdate = this.computeStateUpdate(propsUpdate)

        return {
            makerDeltaUnits: makerDeltaUnits,
            makerDeltaCoins: makerDeltaCoins,
            statusUpdate: statusUpdate,
        }
    }
}
