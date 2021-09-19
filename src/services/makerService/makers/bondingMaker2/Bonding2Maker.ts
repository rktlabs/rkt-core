'use strict'

import { round4, MakerFill, MarketOrder, NotFoundError, MakerTrade, PortfolioRepository } from '../../../..'

import admin = require('firebase-admin')
import { DateTime } from 'luxon'
import { MakerBase } from '../makerBase/entity'
import { TNewMakerConfig, TMaker, TTakeResult } from '../makerBase/types'
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
    private portfolioRepository: PortfolioRepository

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
        this.portfolioRepository = new PortfolioRepository()
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

    async processOrder(order: MarketOrder) {
        ///////////////////////////////////////////////////
        // create trade and fill in maker from asset pools
        const trade = new MakerTrade(order)
        const taker = trade.taker

        // for bid (a buy) I'm "removing" units from the pool, so flip sign
        const signedTakeSize = trade.taker.orderSide === 'ask' ? taker.orderSize * -1 : taker.orderSize

        ////////////////////////////
        // verify that asset exists
        ////////////////////////////
        const assetId = order.assetId
        const asset = await this.assetRepository.getDetailAsync(assetId)
        if (!asset) {
            const msg = `Invalid Order: Asset: ${assetId} does not exist`
            throw new NotFoundError(msg, { assetId })
        }

        ////////////////////////////////////////////////////////
        // Process the order
        ////////////////////////////////////////////////////////
        // TODO: There is an assumption that the maker portfolio is the asset. That would,
        // actually, be up to the maker, yes?
        const assetPortfolioId = asset.portfolioId
        if (assetPortfolioId) {
            const assetPortfolio = await this.portfolioRepository.getDetailAsync(assetPortfolioId)
            if (!assetPortfolio) {
                const msg = `Invalid Order: Asset Portfolio: ${assetPortfolioId} does not exist`
                throw new NotFoundError(msg, { assetPortfolioId })
            }
        } else {
            const msg = `Invalid Order: Asset Portfolio: not configured`
            throw new NotFoundError(msg)
        }

        const makerPortfolioId = assetPortfolioId

        const taken = this.processOrderUnits(signedTakeSize)
        if (taken) {
            const data = taken.statusUpdate
            await this.updateMakerStateAsync(assetId, data)

            const { makerDeltaUnits, makerDeltaCoins } = taken

            const makerFill = new MakerFill({
                assetId: taker.assetId,
                portfolioId: makerPortfolioId,
                orderSide: taker.orderSide === 'bid' ? 'ask' : 'bid', // flip side from taker
                orderSize: taker.orderSize,
            })

            trade.fillMaker(makerFill, makerDeltaUnits, makerDeltaCoins)

            // if (trade.taker.filledSize !== 0) {
            //     //     // await this.onFill(trade.taker)
            //     //     // await this.onTrade(trade)
            //     await this.onUpdateQuote(trade, bid, ask)
            // }

            return trade
        } else {
            return null
        }
    }

    async processSimpleOrder(assetId: string, orderSide: string, orderSize: number) {
        return null
    }

    async updateMakerStateAsync(assetId: string, data: any) {
        return this.makerRepository.updateMakerStateAsync(assetId, data)
    }

    async buy(userId: string, assetId: string, units: number) {
        return null
    }

    async sell(userId: string, assetId: string, units: number) {
        return null
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
        //const bid = bondingFunction(this.params.madeUnits - makerDeltaUnits - 1, makerParams)
        const ask = bondingFunction(this.params.madeUnits - makerDeltaUnits - 0, makerParams)
        // const last = bid

        const propsUpdate: TBonding2MakerParamsUpdate = {
            madeUnitsDelta: makerDeltaUnits * -1,
            currentPrice: ask,
        }

        const statusUpdate = this.computeStateUpdate(propsUpdate)

        return {
            // bid: bid,
            // ask: ask,
            // last: last,
            makerDeltaUnits: makerDeltaUnits,
            makerDeltaCoins: makerDeltaCoins,
            statusUpdate: statusUpdate,
        }
    }
}
