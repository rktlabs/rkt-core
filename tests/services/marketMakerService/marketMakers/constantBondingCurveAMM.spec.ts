'use strict'
/* eslint-env node, mocha */

import { expect } from 'chai'
import {
    AssetRepository,
    PortfolioRepository,
    TransactionRepository,
    MarketMakerRepository,
    ConstantBondingCurveAMM,
} from '../../../../src'

describe('ConstantBondingCurveAMM', function () {
    const assetRepository = new AssetRepository()
    const portfolioRepository = new PortfolioRepository()
    const transactionRepository = new TransactionRepository()
    const marketMakerRepository = new MarketMakerRepository()

    describe('bonding curve', function () {
        let makerConfig = {
            createdAt: '2021-05-07',
            portfolioId: 'asset::card::testehed',
            type: 'constantBondingCurveAMM',
            ownerId: 'test',
            assetId: 'card::testehed',
            params: {},
        }

        beforeEach(() => {
            makerConfig.params = {}
        })

        it('simple amm initial current price should be 1', () => {
            makerConfig.params = {
                e: 0,
                m: 5,
                madeUnits: 0,
                cumulativeValue: 0,
                y0: 0,
            }

            const marketMaker = new ConstantBondingCurveAMM(
                assetRepository,
                portfolioRepository,
                transactionRepository,
                marketMakerRepository,
                makerConfig,
            )
            const currentPrice = marketMaker.spot_price()
            expect(currentPrice).to.eq(5)
        })

        it('simple amm with 4 units current price should be 5', () => {
            makerConfig.params = {
                e: 0,
                m: 5,
                madeUnits: 4,
                cumulativeValue: 0,
                y0: 0,
            }

            const marketMaker = new ConstantBondingCurveAMM(
                assetRepository,
                portfolioRepository,
                transactionRepository,
                marketMakerRepository,
                makerConfig,
            )
            const currentPrice = marketMaker.spot_price()
            expect(currentPrice).to.eq(5)
        })

        it('simple amm should support buy 4 units', () => {
            makerConfig.params = {
                e: 0,
                m: 5,
                madeUnits: 0,
                cumulativeValue: 0,
                y0: 0,
            }

            const marketMaker = new ConstantBondingCurveAMM(
                assetRepository,
                portfolioRepository,
                transactionRepository,
                marketMakerRepository,
                makerConfig,
            )
            const cost = marketMaker.compute_price(4)
            expect(cost).to.eq(20)
        })

        it('simple amm should with initial units should support buy at higher price', () => {
            makerConfig.params = {
                e: 0,
                m: 5,
                madeUnits: 4,
                cumulativeValue: 0,
                y0: 0,
            }

            const marketMaker = new ConstantBondingCurveAMM(
                assetRepository,
                portfolioRepository,
                transactionRepository,
                marketMakerRepository,
                makerConfig,
            )
            const cost = marketMaker.compute_price(4)
            expect(cost).to.eq(20)
        })

        it('simple amm should have symmetric price/value', () => {
            makerConfig.params = {
                e: 0,
                m: 5,
                madeUnits: 4,
                cumulativeValue: 0,
                y0: 0,
            }

            const marketMaker = new ConstantBondingCurveAMM(
                assetRepository,
                portfolioRepository,
                transactionRepository,
                marketMakerRepository,
                makerConfig,
            )
            const cost = marketMaker.compute_value(4)
            expect(cost).to.eq(20)

            const cost2 = marketMaker.compute_price(-4)
            expect(cost2).to.eq(-20)
        })
    })

    describe('marketMaker process order', function () {
        let makerConfig = {
            createdAt: '2021-05-07',
            portfolioId: 'asset::card::testehed',
            type: 'constantBondingCurveAMM',
            ownerId: 'test',
            assetId: 'card::testehed',
            params: {},
        }

        beforeEach(() => {
            makerConfig.params = {}
        })

        it('buy', () => {
            makerConfig.params = {
                e: 0,
                m: 5,
                madeUnits: 0,
                cumulativeValue: 0,
                y0: 0,
            }

            const marketMaker = new ConstantBondingCurveAMM(
                assetRepository,
                portfolioRepository,
                transactionRepository,
                marketMakerRepository,
                makerConfig,
            )
            const result = marketMaker.processAMMOrderImpl(4)
            expect(result.makerDeltaUnits).eq(-4)
            expect(result.makerDeltaValue).eq(20)
            expect(result.quote?.last?.side).eq('bid')
            expect(result.quote?.last?.units).eq(4)
            expect(result.quote?.last?.value).eq(20)
            expect(result.quote?.last?.unitValue).eq(5)

            expect(marketMaker.params.madeUnits).eq(4)
            expect(marketMaker.params.cumulativeValue).eq(20)

            const result2 = marketMaker.processAMMOrderImpl(10)

            // verify that ask quote matches price paid for that purchase
            expect(result2.quote.last?.unitValue).eq(result.quote.bid10)
        })
    })
})
