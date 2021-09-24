'use strict'
/* eslint-env node, mocha */

import { expect } from 'chai'
import {
    AssetRepository,
    AssetService,
    BondingCurveAMM,
    BootstrapService,
    IMarketMaker,
    LeagueRepository,
    MarketMakerRepository,
    MarketMakerService,
    PortfolioRepository,
    TNewMarketMakerConfig,
    TransactionRepository,
    UserRepository,
} from '../../../../src'

describe('BondingCurveAMM', function () {
    const assetRepository = new AssetRepository()
    const portfolioRepository = new PortfolioRepository()
    const transactionRepository = new TransactionRepository()
    const marketMakerRepository = new MarketMakerRepository()

    describe('bonding curve', function () {
        let makerConfig = {
            createdAt: '2021-05-07',
            portfolioId: 'asset::card::testehed',
            type: 'bondingCurveAMM',
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

            const marketMaker = new BondingCurveAMM(
                assetRepository,
                portfolioRepository,
                transactionRepository,
                marketMakerRepository,
                makerConfig,
            )
            const currentPrice = marketMaker.spot_price()
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

            const marketMaker = new BondingCurveAMM(
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
                e: 1,
                m: 1,
                madeUnits: 0,
                cumulativeValue: 0,
                y0: 1,
            }

            const marketMaker = new BondingCurveAMM(
                assetRepository,
                portfolioRepository,
                transactionRepository,
                marketMakerRepository,
                makerConfig,
            )
            const cost = marketMaker.compute_price(4)
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

            const marketMaker = new BondingCurveAMM(
                assetRepository,
                portfolioRepository,
                transactionRepository,
                marketMakerRepository,
                makerConfig,
            )
            const cost = marketMaker.compute_price(4)
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

            const marketMaker = new BondingCurveAMM(
                assetRepository,
                portfolioRepository,
                transactionRepository,
                marketMakerRepository,
                makerConfig,
            )
            const cost = marketMaker.compute_value(4)
            expect(cost).to.eq(12)

            const cost2 = marketMaker.compute_price(-4)
            expect(cost2).to.eq(-12)
        })
    })

    describe('marketMaker process order', function () {
        let makerConfig = {
            createdAt: '2021-05-07',
            portfolioId: 'asset::card::testehed',
            type: 'bondingCurveAMM',
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

            const marketMaker = new BondingCurveAMM(
                assetRepository,
                portfolioRepository,
                transactionRepository,
                marketMakerRepository,
                makerConfig,
            )
            const result = marketMaker.processAMMOrderImpl(4)
            expect(result.makerDeltaUnits).eq(-4)
            expect(result.makerDeltaValue).eq(12)
            expect(result.quote?.last?.side).eq('bid')
            expect(result.quote?.last?.units).eq(4)
            expect(result.quote?.last?.value).eq(12)
            expect(result.quote?.last?.unitValue).eq(3)

            expect(marketMaker.params.madeUnits).eq(4)
            expect(marketMaker.params.cumulativeValue).eq(12)

            const result2 = marketMaker.processAMMOrderImpl(10)

            // verify that ask quote matches price paid for that purchase
            expect(result2.quote.last?.unitValue).eq(result.quote.bid10)
        })
    })

    describe('persist marketMaker', function () {
        this.timeout(10000)

        let bootstrapper: BootstrapService
        let assetRepository: AssetRepository
        let leagueRepository: LeagueRepository
        let assetService: AssetService
        let marketMakerService: MarketMakerService
        let marketMakerRepository: MarketMakerRepository
        let userRepository: UserRepository

        const assetId = 'card::testehed'
        let marketMaker: IMarketMaker

        before(async () => {
            assetRepository = new AssetRepository()
            userRepository = new UserRepository()
            marketMakerRepository = new MarketMakerRepository()

            bootstrapper = new BootstrapService(
                assetRepository,
                portfolioRepository,
                transactionRepository,
                userRepository,
                marketMakerRepository,
                leagueRepository,
            )
            assetService = new AssetService(
                assetRepository,
                portfolioRepository,
                marketMakerRepository,
                transactionRepository,
            )
            marketMakerService = new MarketMakerService(
                assetRepository,
                portfolioRepository,
                transactionRepository,
                marketMakerRepository,
            )
            await bootstrapper.bootstrap()

            await assetService.scrubAsset(assetId)

            const assetConfig = {
                ownerId: 'test',
                symbol: assetId,
                displayName: assetId,
                tags: {
                    test: true,
                },
            }

            await assetService.createAsset(assetConfig)
        })

        describe('persist marketMaker', function () {
            beforeEach(async () => {
                await marketMakerService.scrubMarketMaker(assetId)
                const makerConfig: TNewMarketMakerConfig = {
                    type: 'bondingCurveAMM',
                    ownerId: 'test',
                    assetId: assetId,
                    tags: {
                        test: true,
                    },
                    settings: {
                        initialUnits: 0,
                        initialValue: 0,
                        initialPrice: 1,
                        e: 1,
                        m: 1,
                    },
                }

                marketMaker = await marketMakerService.createMarketMaker(makerConfig, false)
                expect(marketMaker).to.exist
            })

            describe('Create Basic MarketMaker', () => {
                it('should create', async () => {
                    await marketMaker.processOrderImpl('bid', 4)

                    const readBack = await marketMakerRepository.getDetailAsync(assetId)
                    if (readBack) {
                        expect(readBack?.quote?.last?.side).eq('bid')
                        expect(readBack?.quote?.last?.units).eq(4)
                        expect(readBack?.quote?.last?.value).eq(12)
                        expect(readBack?.quote?.last?.unitValue).eq(3)

                        expect(readBack.params.madeUnits).eq(4)
                        expect(readBack.params.cumulativeValue).eq(12)
                    } else {
                        expect.fail('nothing read back')
                    }
                })
            })

            describe('Create Basic MarketMaker', () => {
                it('should create', async () => {
                    await marketMaker.processOrderImpl('bid', 2)

                    const readBack = await marketMakerRepository.getDetailAsync(assetId)
                    if (readBack) {
                        expect(readBack?.quote?.last?.side).eq('bid')
                        expect(readBack?.quote?.last?.units).eq(2)
                        expect(readBack?.quote?.last?.value).eq(4)
                        expect(readBack?.quote?.last?.unitValue).eq(2)

                        expect(readBack.params.madeUnits).eq(2)
                        expect(readBack.params.cumulativeValue).eq(4)
                    } else {
                        expect.fail('nothing read back')
                    }
                })
            })
        })

        describe('persist marketMaker with units', function () {
            beforeEach(async () => {
                await marketMakerService.scrubMarketMaker(assetId)
                const makerConfig: TNewMarketMakerConfig = {
                    type: 'bondingCurveAMM',
                    ownerId: 'test',
                    assetId: assetId,
                    tags: {
                        test: true,
                    },
                    settings: {
                        initialUnits: 4,
                        initialValue: 12,
                        initialPrice: 1,
                        e: 1,
                        m: 1,
                    },
                }

                marketMaker = await marketMakerService.createMarketMaker(makerConfig, false)
                expect(marketMaker).to.exist
            })

            describe('Create Basic MarketMaker', () => {
                it('should create', async () => {
                    await marketMaker.processOrderImpl('ask', 2)

                    const readBack = await marketMakerRepository.getDetailAsync(assetId)
                    if (readBack) {
                        expect(readBack?.quote?.last?.side).eq('ask')
                        expect(readBack?.quote?.last?.units).eq(2)
                        expect(readBack?.quote?.last?.value).eq(8)
                        expect(readBack?.quote?.last?.unitValue).eq(4)

                        expect(readBack.params.madeUnits).eq(2)
                        expect(readBack.params.cumulativeValue).eq(4)
                    } else {
                        expect.fail('nothing read back')
                    }
                })
            })
        })
    })
})
