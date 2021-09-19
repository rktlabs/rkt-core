'use strict'

import { round4, MakerFill, TakerOrder, NotFoundError, MakerTrade, PortfolioRepository } from '../../../..'

import admin = require('firebase-admin')
import { DateTime } from 'luxon'
import { MakerBase } from '../makerBase/entity'
import { TNewMakerConfig, TMaker, TTakeResult } from '../makerBase/types'
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

        const newEntity = new KMaker(makerProps)
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

    async processTakerOrder(order: TakerOrder) {
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

    ////////////////////////////////////////////////////////
    // PRIVATE
    ////////////////////////////////////////////////////////

    private processOrderUnits(takeSize: number): TTakeResult | null {
        const makerParams = this.params as TKMakerParams
        if (!makerParams) {
            return null
        }
        const {
            // lastPrice: ask,
            propsUpdate,
        } = this.computePrice(makerParams, takeSize)
        // const { lastPrice: bid } = this.computePrice(makerParams, takeSize - 1)

        const statusUpdate = this.computeStateUpdate(propsUpdate)

        return {
            // bid: bid,
            // ask: ask,
            // last: bid,
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
