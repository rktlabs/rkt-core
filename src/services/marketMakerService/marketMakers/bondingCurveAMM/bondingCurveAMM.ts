'use strict'

import { DateTime } from 'luxon'
import { MarketMakerBase, TMakerResult, TMarketMaker, TMarketMakerQuote, TNewMarketMakerConfig } from '../..'
import { MintService } from '../../..'
import {
    AssetHolderRepository,
    AssetRepository,
    ConflictError,
    MarketMakerRepository,
    NotFoundError,
    PortfolioRepository,
    round4,
    TransactionRepository,
} from '../../../..'
import admin = require('firebase-admin')
const FieldValue = admin.firestore.FieldValue

type BondingCurveAMMParams = {
    madeUnits: number
    cumulativeValue: number
    y0: number
    e: number
    m: number
}

export class BondingCurveAMM extends MarketMakerBase {
    private assetHolderRepository: AssetHolderRepository
    private mintService: MintService

    static newMaker(
        assetRepository: AssetRepository,
        portfolioRepository: PortfolioRepository,
        transactionRepository: TransactionRepository,
        marketMakerRepository: MarketMakerRepository,
        props: TNewMarketMakerConfig,
    ) {
        const createdAt = DateTime.utc().toString()
        const type = props.type
        const assetId = props.assetId

        const makerProps: TMarketMaker = {
            createdAt,
            type,
            assetId,
            ownerId: props.ownerId,
            tags: props.tags,
        }

        const newEntity = new BondingCurveAMM(
            assetRepository,
            portfolioRepository,
            transactionRepository,
            marketMakerRepository,
            makerProps,
        )
        newEntity.params = newEntity.computeInitialState(props.settings)

        /////////////////////////////////////////////////////////
        // compute the quote(s)
        /////////////////////////////////////////////////////////
        const quote: TMarketMakerQuote = {
            current: newEntity.spot_price(),
            bid1: newEntity.compute_price(),
            ask1: newEntity.compute_value(),
            bid10: newEntity.compute_price(10) / 10,
            ask10: newEntity.params.madeUnits >= 10 ? newEntity.compute_value(10) / 10 : NaN,
        }

        return newEntity
    }

    private computeInitialState(settings: any): BondingCurveAMMParams {
        const makerState: BondingCurveAMMParams = {
            madeUnits: settings?.initialUnits || 0,
            cumulativeValue: settings?.initialValue || 0,
            y0: settings?.initialPrice || 1,
            e: settings?.e || 1,
            m: settings?.m || 1,
        }
        return makerState
    }

    constructor(
        assetRepository: AssetRepository,
        portfolioRepository: PortfolioRepository,
        transactionRepository: TransactionRepository,
        marketMakerRepository: MarketMakerRepository,
        props: TMarketMaker,
    ) {
        super(assetRepository, portfolioRepository, transactionRepository, marketMakerRepository, props)
        this.assetHolderRepository = new AssetHolderRepository()
        this.mintService = new MintService(assetRepository, portfolioRepository, transactionRepository)
    }

    async processOrderImpl(orderSide: string, orderSize: number) {
        ////////////////////////////
        // verify that asset exists
        ////////////////////////////
        const asset = await this.resolveAssetSpec(this.assetId)

        // this marketMaker pulls asset units from asset portfolio directly
        const assetPortfolioId = asset.portfolioId
        if (!assetPortfolioId) {
            const msg = `Invalid Order: Asset Portfolio: not configured`
            throw new NotFoundError(msg)
        }

        ////////////////////////////////////////////////////////
        // If asset doesn't have enough units, mint more
        ////////////////////////////////////////////////////////
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

        ////////////////////////////////////////////////////////
        // Process the order
        ////////////////////////////////////////////////////////
        // for bid (a buy) I'm "removing" units from the pool, so flip sign
        const signedTakerOrderSize = orderSide === 'ask' ? orderSize * -1 : orderSize

        const taken = this.processAMMOrderImpl(signedTakerOrderSize)
        if (taken) {
            const data = taken.stateUpdate
            data.quote = taken.quote
            await this.marketMakerRepository.updateMakerStateAsync(this.assetId, data)
            return taken
        } else {
            return null
        }
    }

    ////////////////////////////////////////////////////////
    // PRIVATE
    ////////////////////////////////////////////////////////

    // positive order size - buy from marketMaker
    // negative order size - sel to marketMaker
    processAMMOrderImpl(signedTakerOrderSize: number) {
        const makerParams = this.params as BondingCurveAMMParams
        if (!makerParams) {
            const msg = `Error: MarketMaker Parms not available: ${this.assetId}`
            throw new ConflictError(msg)
        }

        let makerDeltaUnits = 0
        let makerDeltaValue = 0

        if (signedTakerOrderSize >= 0) {
            // this is a buy so makerDeltaUnits should be negative - units leaving marketMaker
            // and makerDeltaValue should be positive - value added to marketMaker
            makerDeltaUnits = signedTakerOrderSize * -1
            makerDeltaValue = this.compute_price(signedTakerOrderSize)
        } else {
            // this is a sell-back - so limited to number of units ever made
            const limitedTakeSize = Math.max(signedTakerOrderSize, this.params.madeUnits * -1)
            makerDeltaUnits = limitedTakeSize * -1
            makerDeltaValue = this.compute_value(makerDeltaUnits) * -1
        }

        /////////////////////////////////////////////////////////
        // compute marketMaker update(s)
        /////////////////////////////////////////////////////////
        this.params.madeUnits += makerDeltaUnits * -1
        this.params.cumulativeValue += makerDeltaValue

        /////////////////////////////////////////////////////////
        // compute the quote(s)
        /////////////////////////////////////////////////////////
        const units = Math.abs(makerDeltaUnits)
        const value = Math.abs(makerDeltaValue)
        const quote: TMarketMakerQuote = {
            last: {
                side: makerDeltaUnits < 0 ? 'bid' : 'ask',
                units: units,
                value: value,
                unitValue: value / units,
            },
            current: this.spot_price(),
            bid1: this.compute_price(),
            ask1: this.compute_value(),
            bid10: this.compute_price(10) / 10,
            ask10: this.params.madeUnits >= 10 ? this.compute_value(10) / 10 : NaN,
        }

        this.quote = quote

        // NOTE: made units is inverse of "delta Units". It counts up for each buy
        // NOTE: Each marketMaker type has it's own way to "update" the persistent marketMaker state
        // so construct that here (the FieldValue does an atomic add to value.)
        const stateUpdate = {
            ['params.madeUnits']: FieldValue.increment(makerDeltaUnits * -1),
            ['params.cumulativeValue']: FieldValue.increment(makerDeltaValue),
        }

        const result: TMakerResult = {
            makerDeltaUnits: makerDeltaUnits,
            makerDeltaValue: makerDeltaValue,
            stateUpdate: stateUpdate,
            quote: quote,
        }

        return result
    }

    ////////////////////////////////////////////////////////
    // Bonding function
    ////////////////////////////////////////////////////////

    //////////////////////////////////////////
    // the current price point
    spot_price(): number {
        return this.__current_price_function(this.params.madeUnits)
    }

    //////////////////////////////////////////
    // the price to purchase units (default to 1)
    compute_price(units: number = 1): number {
        return this.__delta_value_function(units)
    }

    //////////////////////////////////////////
    // the value to sell units (default to 1)
    compute_value(units: number = 1): number {
        return -1.0 * this.__delta_value_function(-1.0 * units)
    }

    //////////////////////////////////////////
    // the current price point of transaction at 'epsilon'
    // (the bonding curven evaluated at x)
    private __current_price_function(x: number): number {
        x = Math.max(x, 0)
        const val = this.params.m * x ** this.params.e + this.params.y0
        return val
    }

    //////////////////////////////////////////
    // the total value of x units
    // (area under the bonding curve from 0 to x)
    private __total_value_function(x: number): number {
        x = Math.max(x, 0)
        const inc = this.params.e + 1.0
        const val = (this.params.m * x ** inc) / inc + this.params.y0 * x
        return val
    }

    //////////////////////////////////////////
    // the value of x units if applie right now - x is signed
    // (the area under bonding curve from current x to  +/- some delta)
    private __delta_value_function(delta_units: number): number {
        const cost =
            this.__total_value_function(this.params.madeUnits + delta_units) -
            this.__total_value_function(this.params.madeUnits)
        return cost
    }
}
