'use strict'

import {
    round4,
    MakerFill,
    TakerOrder as TakerOrder,
    NotFoundError,
    MakerTrade,
    PortfolioRepository,
    AssetHolderRepository,
    InsufficientBalance,
    MintService,
} from '../../../..'

import admin = require('firebase-admin')
import { DateTime } from 'luxon'
import { MakerBase } from '../makerBase/entity'
import { TNewMakerConfig, TMaker, TTakeResult } from '../makerBase/types'
const FieldValue = admin.firestore.FieldValue

type TBonding1MakerParamsUpdate = {
    madeUnitsDelta: number
    currentPrice: number
}

type TBonding1MakerParams = {
    madeUnits: number
    x0: number
}

const bondingFunction = (x: number, params: TBonding1MakerParams) => {
    // return x + 1
    // return 1.05 ** x
    const x0 = params.x0
    return x + x0 === 0 ? 1 : 1 + (x + x0) ** (1 / 2)
}

const inverseBondingFunction = (currentPrice: number, madeUnits: number): TBonding1MakerParams => {
    // return y - 1
    // return y ** (1/1.05)
    const params = {
        madeUnits: madeUnits,
        x0: (currentPrice - 1) ** 2 - madeUnits,
    }
    return params
}

export class Bonding1Maker extends MakerBase {
    private portfolioRepository: PortfolioRepository
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

        const newEntity = new Bonding1Maker(makerProps)
        newEntity.params = newEntity.computeInitialState(props)

        return newEntity
    }

    constructor(props: TMaker) {
        super(props)
        this.portfolioRepository = new PortfolioRepository()
        this.assetHolderRepository = new AssetHolderRepository()
        this.mintService = new MintService()
    }

    computeInitialState(newMakerConfig: TNewMakerConfig) {
        const initMadeUnits = newMakerConfig.settings?.initMadeUnits || 0
        const initPrice = newMakerConfig.settings?.initPrice || 1
        const makerState = inverseBondingFunction(initPrice, initMadeUnits)
        return makerState
    }

    computeStateUpdate(stateUpdate: TBonding1MakerParamsUpdate) {
        const data = {
            ['params.madeUnits']: FieldValue.increment(stateUpdate.madeUnitsDelta),
            currentPrice: stateUpdate.currentPrice,
        }
        return data
    }

    async processTakerOrder(order: TakerOrder) {
        const assetId = order.assetId
        const orderSide = order.orderSide
        const orderSize = order.orderSize
        const trade = new MakerTrade(order)

        ////////////////////////////
        // verify that asset exists
        ////////////////////////////
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

        if (orderSide == 'bid' && orderSize > 0) {
            // test that asset has enough units to transact
            const assetPortfolioHoldings = await this.assetHolderRepository.getDetailAsync(assetId, assetPortfolioId)
            const portfolioHoldingUnits = round4(assetPortfolioHoldings?.units || 0)
            if (portfolioHoldingUnits < orderSize) {
                const delta = orderSize - portfolioHoldingUnits
                // not enough. mint me sonme
                await this.mintService.mintUnits(assetId, delta)
            }
        }

        const tradeStats = await this.processSimpleOrder(assetId, orderSide, orderSize)
        if (tradeStats) {
            let { makerDeltaUnits, makerDeltaCoins } = tradeStats
            const makerFill = new MakerFill({
                assetId: assetId,
                portfolioId: assetPortfolioId,
                orderSide: orderSide === 'bid' ? 'ask' : 'bid', // flip side from taker
                orderSize: orderSize,
            })

            trade.fillMaker(makerFill, makerDeltaUnits, makerDeltaCoins)

            return trade
        } else {
            return null
        }
    }

    async processSimpleOrder(assetId: string, orderSide: string, orderSize: number) {
        // for bid (a buy) I'm "removing" units from the pool, so flip sign
        const signedOrderSize = orderSide === 'ask' ? orderSize * -1 : orderSize

        const taken = this.processOrderUnits(signedOrderSize)
        if (taken) {
            const data = taken.statusUpdate
            await this.updateMakerStateAsync(assetId, data)

            const { makerDeltaUnits, makerDeltaCoins } = taken

            return { makerDeltaUnits, makerDeltaCoins }
        } else {
            return null
        }
    }

    async updateMakerStateAsync(assetId: string, data: any) {
        return this.makerRepository.updateMakerStateAsync(assetId, data)
    }

    ////////////////////////////////////////////////////////
    // PRIVATE
    ////////////////////////////////////////////////////////

    private processOrderUnits(takeSize: number): TTakeResult | null {
        const makerParams = this.params as TBonding1MakerParams
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
        // const bid = bondingFunction(this.params.madeUnits - makerDeltaUnits - 1, makerParams)
        const ask = bondingFunction(this.params.madeUnits - makerDeltaUnits - 0, makerParams)
        // const last = bid

        const propsUpdate: TBonding1MakerParamsUpdate = {
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
