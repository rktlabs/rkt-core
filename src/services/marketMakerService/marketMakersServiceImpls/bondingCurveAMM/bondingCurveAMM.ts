'use strict'

import * as log4js from 'log4js'

import admin = require('firebase-admin')
import { MintService } from '../../..'
import {
    AssetRepository,
    PortfolioRepository,
    TransactionRepository,
    MarketMakerRepository,
    AssetHolderRepository,
    NotFoundError,
    ExchangeTrade,
    OrderSide,
    round4,
    ConflictError,
    TExchangeQuoteLast,
    TExchangeQuote,
    TMarketMaker,
    TExchangeOrder,
} from '../../../..'
import { MarketMakerServiceBase, TMakerResult } from '../../marketMakerServiceBase'

const FieldValue = admin.firestore.FieldValue
const logger = log4js.getLogger('BondingCurveAMMParams')

export type BondingCurveAMMSettings = {
    initialUnits?: number
    initialValue?: number
    initialPrice?: number
}

export type BondingCurveAMMParams = {
    madeUnits: number
    cumulativeValue: number
    y0: number
    e: number
    m: number
}

export class BondingCurveAMM extends MarketMakerServiceBase {
    protected assetRepository: AssetRepository
    protected portfolioRepository: PortfolioRepository
    protected transactionRepository: TransactionRepository
    protected marketMakerRepository: MarketMakerRepository

    private assetHolderRepository: AssetHolderRepository
    private mintService: MintService

    constructor(
        assetRepository: AssetRepository,
        portfolioRepository: PortfolioRepository,
        transactionRepository: TransactionRepository,
        marketMakerRepository: MarketMakerRepository,
        props: TMarketMaker,
    ) {
        super(props)

        this.assetRepository = assetRepository
        this.portfolioRepository = portfolioRepository
        this.transactionRepository = transactionRepository
        this.marketMakerRepository = marketMakerRepository

        this.assetHolderRepository = new AssetHolderRepository()
        this.mintService = new MintService(assetRepository, portfolioRepository, transactionRepository)
    }

    async processOrder(order: TExchangeOrder) {
        logger.trace(
            `marketMaker processOrder: ${order.orderInput.sourceOrderId} for portfolio: ${order.portfolioId} asset: ${order.orderInput.assetId}`,
        )
        const assetId = order.orderInput.assetId
        const orderSide = order.orderInput.orderSide
        const orderSize = order.orderInput.orderSize

        //////////////////////////////////////////////////
        // verify that asset exists - need it to exist and have protfolioId
        //////////////////////////////////////////////////
        const asset = await this.assetRepository.getDetailAsync(assetId)
        if (!asset) {
            const msg = `Invalid Order: Asset: ${assetId} does not exist`
            logger.error(msg)
            throw new NotFoundError(msg, { assetId })
        }

        // for this marketMaker, the asset portfolio holds the unit stock.
        const assetPortfolioId = asset.portfolioId
        if (!assetPortfolioId) {
            const msg = `Invalid Order: Asset Portfolio: not configured for ${assetId}`
            logger.error(msg)
            throw new NotFoundError(msg)
        }

        ////////////////////////////////////////////////////////
        // Process the order
        ////////////////////////////////////////////////////////
        const processMakerTrade = await this.processOrderImpl(assetPortfolioId, orderSide, orderSize)
        if (processMakerTrade) {
            let { orderId, makerDeltaUnits, makerDeltaValue } = processMakerTrade

            const trade = new ExchangeTrade(order)
            trade.supplyMakerSide({
                orderId: orderId,
                assetId: assetId,
                portfolioId: assetPortfolioId,
                orderSide: orderSide === 'bid' ? 'ask' : 'bid', // flip side from taker
                orderSize: orderSize,
                makerDeltaUnits: makerDeltaUnits,
                makerDeltaValue: makerDeltaValue,
            })
            logger.trace(
                `marketMaker trade: order: ${order.orderInput.sourceOrderId} units: ${makerDeltaUnits} value: ${makerDeltaValue}`,
            )

            this.emitTrade(trade)

            return true
        } else {
            logger.trace(`marketMaker processOrder: NO TRADE for order: ${order.orderInput.sourceOrderId}`)
            return false
        }
    }

    ////////////////////////////////////////////////////////
    // PRIVATE
    ////////////////////////////////////////////////////////

    // NOTE: Only public for testing unerlying algorithm
    async processOrderImpl(assetPortfolioId: string, orderSide: OrderSide, orderSize: number) {
        ////////////////////////////
        // verify that asset exists
        ////////////////////////////

        // this marketMaker pulls asset units from asset portfolio directly
        if (!assetPortfolioId) {
            const msg = `Invalid Order: Asset Portfolio: not configured`
            logger.error(msg)
            throw new NotFoundError(msg)
        }

        ////////////////////////////////////////////////////////
        // If asset doesn't have enough units, mint more
        ////////////////////////////////////////////////////////
        if (orderSide == 'bid' && orderSize > 0) {
            // test that asset has enough units to transact
            const assetPortfolioHoldings = await this.assetHolderRepository.getDetailAsync(
                this.marketMaker.assetId,
                assetPortfolioId,
            )
            const portfolioHoldingUnits = round4(assetPortfolioHoldings?.units || 0)
            if (portfolioHoldingUnits < orderSize) {
                const delta = orderSize - portfolioHoldingUnits
                const value = this.computePrice(delta)
                // not enough. mint me sonme
                await this.mintService.mintUnits(this.marketMaker.assetId, delta, value)
            }
        }

        ////////////////////////////////////////////////////////
        // Process the order
        ////////////////////////////////////////////////////////
        // for bid (a buy) I'm "removing" units from the pool, so flip sign
        const signedTakerOrderSize = orderSide === 'ask' ? orderSize * -1 : orderSize

        const taken = this.processOrderSize(signedTakerOrderSize)
        if (taken) {
            await this.marketMakerRepository.updateMakerStateAsync(this.marketMaker.assetId, taken.stateUpdate)
            return taken
        } else {
            return null
        }
    }

    // NOTE: Only public for testing unerlying algorithm
    // positive order size - buy from marketMaker
    // negative order size - sel to marketMaker
    processOrderSize(signedTakerOrderSize: number) {
        const makerParams = this.marketMaker.params as BondingCurveAMMParams
        if (!makerParams) {
            const msg = `Error: MarketMaker Parms not available: ${this.marketMaker.assetId}`
            logger.error(msg)
            throw new ConflictError(msg)
        }

        let makerDeltaUnits = 0
        let makerDeltaValue = 0

        if (signedTakerOrderSize >= 0) {
            // this is a buy so makerDeltaUnits should be negative - units leaving marketMaker
            // and makerDeltaValue should be positive - value added to marketMaker
            makerDeltaUnits = signedTakerOrderSize * -1
            makerDeltaValue = this.computePrice(signedTakerOrderSize)
        } else {
            // this is a sell-back - so limited to number of units ever made
            const limitedTakeSize = Math.max(signedTakerOrderSize, this.marketMaker.params.madeUnits * -1)
            makerDeltaUnits = limitedTakeSize * -1
            makerDeltaValue = this.computeValue(makerDeltaUnits) * -1
        }

        /////////////////////////////////////////////////////////
        // compute marketMaker update(s)
        /////////////////////////////////////////////////////////
        this.marketMaker.params.madeUnits += makerDeltaUnits * -1
        this.marketMaker.params.cumulativeValue += makerDeltaValue

        /////////////////////////////////////////////////////////
        // compute the quote(s)
        /////////////////////////////////////////////////////////
        const units = Math.abs(makerDeltaUnits)
        const value = Math.abs(makerDeltaValue)
        const last: TExchangeQuoteLast = {
            side: makerDeltaUnits < 0 ? 'bid' : 'ask',
            units: units,
            value: value,
            unitValue: units === 0 ? 0 : Math.abs(round4(value / units)),
        }
        this.marketMaker.quote = this.getQuote(last)
        this.emitQuote(this.marketMaker.quote)

        // NOTE: made units is inverse of "delta Units". It counts up for each buy
        // NOTE: Each marketMaker type has it's own way to "update" the persistent marketMaker state
        // so construct that here (the FieldValue does an atomic add to value.)
        const stateUpdate = {
            ['params.madeUnits']: FieldValue.increment(makerDeltaUnits * -1),
            ['params.cumulativeValue']: FieldValue.increment(makerDeltaValue),
            quote: this.marketMaker.quote,
        }

        const result: TMakerResult = {
            makerDeltaUnits: makerDeltaUnits,
            makerDeltaValue: makerDeltaValue,
            stateUpdate: stateUpdate,
        }

        return result
    }

    ////////////////////////////////////////////////////////
    // Bonding function
    ////////////////////////////////////////////////////////
    getQuote(last?: TExchangeQuoteLast): TExchangeQuote {
        const quote: TExchangeQuote = {
            assetId: this.marketMaker.assetId,
            ask: this.computePrice(),
            ask10: this.computePrice(10) / 10,
            spot: this.spotPrice(),
            bid: this.marketMaker.params.madeUnits >= 1 ? this.computeValue(1) / 1 : NaN,
            bid10: this.marketMaker.params.madeUnits >= 10 ? this.computeValue(10) / 10 : NaN,
        }

        if (last) quote.last = last
        return quote
    }

    //////////////////////////////////////////
    // the current price point
    spotPrice(): number {
        return this._currentPriceFunction(this.marketMaker.params.madeUnits)
    }

    //////////////////////////////////////////
    // the price to purchase units (default to 1)
    computePrice(units: number = 1): number {
        return this._deltaValueFunction(units)
    }

    //////////////////////////////////////////
    // the value to sell units (default to 1)
    computeValue(units: number = 1): number {
        return -1.0 * this._deltaValueFunction(-1.0 * units)
    }

    //////////////////////////////////////////
    // the current price point of transaction at 'epsilon'
    // (the bonding curven evaluated at x)
    private _currentPriceFunction(x: number): number {
        x = Math.max(x, 0)
        const val = this.marketMaker.params.m * x ** this.marketMaker.params.e + this.marketMaker.params.y0
        return val
    }

    //////////////////////////////////////////
    // the total value of x units
    // (area under the bonding curve from 0 to x)
    private _totalValueFunction(x: number): number {
        x = Math.max(x, 0)
        const inc = this.marketMaker.params.e + 1.0
        const val = (this.marketMaker.params.m * x ** inc) / inc + this.marketMaker.params.y0 * x
        return val
    }

    //////////////////////////////////////////
    // the value of x units if applie right now - x is signed
    // (the area under bonding curve from current x to  +/- some delta)
    private _deltaValueFunction(delta_units: number): number {
        const cost =
            this._totalValueFunction(this.marketMaker.params.madeUnits + delta_units) -
            this._totalValueFunction(this.marketMaker.params.madeUnits)
        return cost
    }
}
