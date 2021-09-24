'use strict'
/* eslint-env node, mocha */

import { expect } from 'chai'
import {
    AssetRepository,
    AssetService,
    BootstrapService,
    IMarketMaker,
    MarketMakerRepository,
    MarketMakerService,
    PortfolioRepository,
    TNewMarketMakerConfig,
    TransactionRepository,
    UserRepository,
} from '../../../src'

describe('MarketMakerService', () => {
    describe('persist marketMaker', function () {
        this.timeout(10000)

        let bootstrapper: BootstrapService
        let assetRepository: AssetRepository
        let transactionRepository: TransactionRepository
        let portfolioRepository: PortfolioRepository
        let assetService: AssetService
        let marketMakerService: MarketMakerService
        let marketMakerRepository: MarketMakerRepository
        let userRepository: UserRepository

        const assetId = 'card::testehed'
        let marketMaker: IMarketMaker

        before(async () => {
            assetRepository = new AssetRepository()
            userRepository = new UserRepository()
            transactionRepository = new TransactionRepository()
            bootstrapper = new BootstrapService(
                assetRepository,
                portfolioRepository,
                transactionRepository,
                userRepository,
            )
            assetService = new AssetService(assetRepository, portfolioRepository, transactionRepository)
            marketMakerService = new MarketMakerService(assetRepository, portfolioRepository, transactionRepository)
            marketMakerRepository = new MarketMakerRepository()
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

        describe('buy', () => {
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

            describe('Create Basic MarketMaker', async () => {
                it('should create', async () => {
                    const order = MarketMakerService.generateOrder({
                        assetId: assetId,
                        orderId: 'order1',
                        portfolioId: `asset::${assetId}`,
                        orderSide: 'bid',
                        orderSize: 4,
                    })

                    await marketMaker.processOrder(order)

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
        })

        describe('buy', () => {
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

            describe('Create Basic MarketMaker', async () => {
                it('should create', async () => {
                    const order = MarketMakerService.generateOrder({
                        assetId: assetId,
                        orderId: 'order1',
                        portfolioId: `asset::${assetId}`,
                        orderSide: 'ask',
                        orderSize: 2,
                    })

                    await marketMaker.processOrder(order)

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
