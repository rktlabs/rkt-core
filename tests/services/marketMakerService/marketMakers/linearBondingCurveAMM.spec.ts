'use strict'
/* eslint-env node, mocha */

import { expect } from 'chai'
import {
    AssetRepository,
    PortfolioRepository,
    TransactionRepository,
    MarketMakerRepository,
    LinearBondingCurveAMM,
} from '../../../../src'

describe('LinearBondingCurveAMM', function () {
    const assetRepository = new AssetRepository()
    const portfolioRepository = new PortfolioRepository()
    const transactionRepository = new TransactionRepository()
    const marketMakerRepository = new MarketMakerRepository()

    describe('bonding curve', function () {
        let makerConfig = {
            createdAt: '2021-05-07',
            portfolioId: 'asset::card::testehed',
            type: 'linearBondingCurveAMM',
            ownerId: 'test',
            assetId: 'card::testehed',
            params: {},
        }

        beforeEach(() => {
            makerConfig.params = {}
        })

        it('simple amm initial current price should be 1', () => {
            makerConfig.params = {
                e: 1,
                m: 1,
                madeUnits: 0,
                cumulativeValue: 0,
                y0: 1,
            }

            const marketMaker = new LinearBondingCurveAMM(
                assetRepository,
                portfolioRepository,
                transactionRepository,
                marketMakerRepository,
                makerConfig,
            )
            const currentPrice = marketMaker.spotPrice()
            expect(currentPrice).to.eq(1)
        })

        it('simple amm with 4 units current price should be 5', () => {
            makerConfig.params = {
                e: 1,
                m: 1,
                madeUnits: 4,
                cumulativeValue: 0,
                y0: 1,
            }

            const marketMaker = new LinearBondingCurveAMM(
                assetRepository,
                portfolioRepository,
                transactionRepository,
                marketMakerRepository,
                makerConfig,
            )
            const currentPrice = marketMaker.spotPrice()
            expect(currentPrice).to.eq(5)
        })

        it('simple amm should support buy 4 units', () => {
            makerConfig.params = {
                e: 1,
                m: 1,
                madeUnits: 0,
                cumulativeValue: 0,
                y0: 1,
            }

            const marketMaker = new LinearBondingCurveAMM(
                assetRepository,
                portfolioRepository,
                transactionRepository,
                marketMakerRepository,
                makerConfig,
            )
            const cost = marketMaker.computePrice(4)
            expect(cost).to.eq(12)
        })

        it('simple amm should with initial units should support buy at higher price', () => {
            makerConfig.params = {
                e: 1,
                m: 1,
                madeUnits: 4,
                cumulativeValue: 0,
                y0: 1,
            }

            const marketMaker = new LinearBondingCurveAMM(
                assetRepository,
                portfolioRepository,
                transactionRepository,
                marketMakerRepository,
                makerConfig,
            )
            const cost = marketMaker.computePrice(4)
            expect(cost).to.eq(28)
        })

        it('simple amm should have symmetric price/value', () => {
            makerConfig.params = {
                e: 1,
                m: 1,
                madeUnits: 4,
                cumulativeValue: 0,
                y0: 1,
            }

            const marketMaker = new LinearBondingCurveAMM(
                assetRepository,
                portfolioRepository,
                transactionRepository,
                marketMakerRepository,
                makerConfig,
            )
            const cost = marketMaker.computeValue(4)
            expect(cost).to.eq(12)

            const cost2 = marketMaker.computePrice(-4)
            expect(cost2).to.eq(-12)
        })
    })

    describe('marketMaker process order', function () {
        let makerConfig = {
            createdAt: '2021-05-07',
            portfolioId: 'asset::card::testehed',
            type: 'linearBondingCurveAMM',
            ownerId: 'test',
            assetId: 'card::testehed',
            params: {},
        }

        beforeEach(() => {
            makerConfig.params = {}
        })

        it('buy', () => {
            makerConfig.params = {
                e: 1,
                m: 1,
                madeUnits: 0,
                cumulativeValue: 0,
                y0: 1,
            }

            const marketMaker = new LinearBondingCurveAMM(
                assetRepository,
                portfolioRepository,
                transactionRepository,
                marketMakerRepository,
                makerConfig,
            )
            const result = marketMaker.processOrderSize(4)
            expect(result.makerDeltaUnits).eq(-4)
            expect(result.makerDeltaValue).eq(12)
            expect(result.stateUpdate.quote?.last?.side).eq('bid')
            expect(result.stateUpdate.quote?.last?.units).eq(4)
            expect(result.stateUpdate.quote?.last?.value).eq(12)
            expect(result.stateUpdate.quote?.last?.unitValue).eq(3)

            expect(marketMaker.params.madeUnits).eq(4)
            expect(marketMaker.params.cumulativeValue).eq(12)

            const result2 = marketMaker.processOrderSize(10)

            // verify that ask quote matches price paid for that purchase
            expect(result2.stateUpdate.quote.last?.unitValue).eq(result.stateUpdate.quote.ask10)
        })
    })
})
