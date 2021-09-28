'use strict'
/* eslint-env node, mocha */

import * as log4js from 'log4js'
import { expect } from 'chai'
import {
    AssetFactory,
    BootstrapService,
    IMarketMaker,
    MarketMakerRepository,
    MarketMakerFactory,
    ExchangeService,
    TNewMarketMakerConfig,
    TNewExchangeOrderConfig,
    TreasuryService,
    MintService,
    AssetRepository,
    PortfolioRepository,
    TransactionRepository,
    UserRepository,
    PortfolioOrderRepository,
    PortfolioOrderService,
    TNewPortfolioOrderProps,
    Scrubber,
} from '../../src'

describe('PortfolioOrderService', function () {
    describe('persist marketMaker', function () {
        this.timeout(20000)

        let portfolioRepository = new PortfolioRepository()
        let assetRepository = new AssetRepository()
        let userRepository = new UserRepository()
        let transactionRepository = new TransactionRepository()
        let portfolioOrderRepository = new PortfolioOrderRepository()
        let marketMakerRepository = new MarketMakerRepository()

        let assetService: AssetFactory
        let marketMakerService: MarketMakerFactory
        let exchangeService: ExchangeService
        let portfolioOrderService: PortfolioOrderService
        let treasuryService: TreasuryService
        let mintService: MintService

        const scrubber = new Scrubber({ assetRepository, portfolioRepository, userRepository })

        const assetId = 'card::testehed'
        let marketMaker: IMarketMaker

        before(async () => {
            assetService = new AssetFactory(assetRepository, portfolioRepository)
            marketMakerService = new MarketMakerFactory(
                assetRepository,
                portfolioRepository,
                transactionRepository,
                marketMakerRepository,
            )
            exchangeService = new ExchangeService(
                assetRepository,
                portfolioRepository,
                transactionRepository,
                marketMakerRepository,
            )
            treasuryService = new TreasuryService(
                assetRepository,
                portfolioRepository,
                transactionRepository,
                userRepository,
            )
            portfolioOrderService = new PortfolioOrderService(
                assetRepository,
                portfolioRepository,
                transactionRepository,
                marketMakerRepository,
                portfolioOrderRepository,
            )
            mintService = new MintService(assetRepository, portfolioRepository, transactionRepository)

            await BootstrapService.boot()
            await treasuryService.mintUnits(900)
            await mintService.mintUnits(assetId, 90)
            await treasuryService.depositCoins('testbot', 80)
        })

        describe('buy', function () {
            beforeEach(async () => {
                await scrubber.scrubMarketMaker(assetId)
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

                marketMaker = await marketMakerService.createMarketMaker(makerConfig, false)
                expect(marketMaker).to.exist
            })

            describe('Create Basic MarketMaker', async () => {
                it('should create', async () => {
                    const orderPayload: TNewPortfolioOrderProps = {
                        orderType: 'market',
                        orderSide: 'bid',
                        assetId: assetId,
                        //portfolioId: `user::testbot`,
                        orderSize: 4,
                        //orderId: 'order1',
                        tags: { test: true },
                    }

                    await portfolioOrderService.submitNewPortfolioOrderAsync(`user::testbot`, orderPayload)

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
                await scrubber.scrubMarketMaker(assetId)
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

                    // await exchangeService.processOrder(orderPayload)
                    await portfolioOrderService.submitNewPortfolioOrderAsync(`user::testbot`, orderPayload)

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
