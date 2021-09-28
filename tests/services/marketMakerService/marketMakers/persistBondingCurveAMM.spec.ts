'use strict'
/* eslint-env node, mocha */

import { expect } from 'chai'
import {
    AssetRepository,
    BootstrapService,
    MarketMakerRepository,
    MarketMakerFactory,
    PortfolioRepository,
    TNewMarketMakerConfig,
    TransactionRepository,
    LinearBondingCurveAMM,
} from '../../../../src'

describe('LinearBondingCurveAMM', function () {
    const assetRepository = new AssetRepository()
    const portfolioRepository = new PortfolioRepository()
    const transactionRepository = new TransactionRepository()
    const marketMakerRepository = new MarketMakerRepository()

    describe('persist marketMaker', function () {
        this.timeout(10000)

        let marketMakerService: MarketMakerFactory

        const assetId = 'card::testehed'
        const assetPortfolioId = 'asset::card::testehed'
        let marketMaker: LinearBondingCurveAMM

        before(async () => {
            marketMakerService = new MarketMakerFactory(
                assetRepository,
                portfolioRepository,
                transactionRepository,
                marketMakerRepository,
            )
            await BootstrapService.boot()
        })

        describe('persist marketMaker', function () {
            beforeEach(async () => {
                await marketMakerService.scrubMarketMaker(assetId)
                const makerConfig: TNewMarketMakerConfig = {
                    type: 'linearBondingCurveAMM',
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

                marketMaker = (await marketMakerService.createMarketMaker(makerConfig, false)) as LinearBondingCurveAMM
                expect(marketMaker).to.exist
            })

            describe('Create Basic MarketMaker', () => {
                it('should create', async () => {
                    await marketMaker.processOrderImpl(assetPortfolioId, 'bid', 4)

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
                    await marketMaker.processOrderImpl(assetPortfolioId, 'bid', 2)

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
                    type: 'linearBondingCurveAMM',
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

                marketMaker = (await marketMakerService.createMarketMaker(makerConfig, false)) as LinearBondingCurveAMM
                expect(marketMaker).to.exist
            })

            describe('Create Basic MarketMaker', () => {
                it('should create', async () => {
                    await marketMaker.processOrderImpl(assetPortfolioId, 'ask', 2)

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
