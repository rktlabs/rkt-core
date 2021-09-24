'use strict'
/* eslint-env node, mocha */

import { expect } from 'chai'
import {
    AssetService,
    BootstrapService,
    IMarketMaker,
    MarketMakerRepository,
    MarketMakerService,
    ExchangeService,
    TNewMarketMakerConfig,
    TNewExchangeOrderConfig,
    TreasuryService,
    MintService,
    AssetRepository,
    PortfolioRepository,
} from '../../src'

describe('ExchangerService', function () {
    describe('persist marketMaker', function () {
        this.timeout(20000)

        let bootstrapper: BootstrapService
        let portfolioRepository: PortfolioRepository
        let assetRepository: AssetRepository
        let assetService: AssetService
        let marketMakerService: MarketMakerService
        let exchangeService: ExchangeService
        let marketMakerRepository: MarketMakerRepository
        let treasuryService: TreasuryService
        let mintService: MintService

        const assetId = 'card::testehed'
        let marketMaker: IMarketMaker

        before(async () => {
            assetRepository = new AssetRepository()
            portfolioRepository = new PortfolioRepository()
            bootstrapper = new BootstrapService(assetRepository, portfolioRepository)
            assetService = new AssetService(assetRepository, portfolioRepository)
            marketMakerService = new MarketMakerService(assetRepository, portfolioRepository)
            exchangeService = new ExchangeService(assetRepository, portfolioRepository)
            treasuryService = new TreasuryService(assetRepository, portfolioRepository)
            mintService = new MintService(assetRepository, portfolioRepository)
            marketMakerRepository = new MarketMakerRepository()
            await bootstrapper.bootstrap()

            await bootstrapper.bootUser()
            await treasuryService.depositCoins('testbot', 100)
            await mintService.mintUnits(assetId, 100)

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

        describe.only('buy', function () {
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
                    const orderPayload: TNewExchangeOrderConfig = {
                        operation: 'order',
                        orderType: 'market',
                        orderSide: 'bid',
                        assetId: assetId,
                        portfolioId: `user::testbot`,
                        orderSize: 4,
                        orderId: 'order1',
                        tags: { test: true },
                    }

                    console.log('do  ----------------------------------')
                    await exchangeService.processNewExchangeOrderAsync(orderPayload)
                    console.log('done----------------------------------')

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

        describe('buy', function () {
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
                    const orderPayload: TNewExchangeOrderConfig = {
                        operation: 'order',
                        orderType: 'market',
                        orderSide: 'ask',
                        assetId: assetId,
                        portfolioId: `user::testbot`,
                        orderSize: 2,
                        orderId: 'orde2',
                        tags: { test: true },
                    }

                    await exchangeService.processNewExchangeOrderAsync(orderPayload)

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
