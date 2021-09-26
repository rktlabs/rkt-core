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
    LeagueRepository,
    PortfolioOrderRepository,
    PortfolioOrderService,
    TNewPortfolioOrderProps,
} from '../../src'
const logger = log4js.getLogger('bootstrapper')

describe('PortfolioOrderService', function () {
    describe('persist marketMaker', function () {
        this.timeout(20000)

        let bootstrapper: BootstrapService
        let portfolioRepository: PortfolioRepository
        let assetRepository: AssetRepository
        let userRepository: UserRepository
        let leagueRepository: LeagueRepository
        let transactionRepository: TransactionRepository
        let portfolioOrderRepository: PortfolioOrderRepository
        let assetService: AssetFactory
        let marketMakerService: MarketMakerFactory
        let exchangeService: ExchangeService
        let portfolioOrderService: PortfolioOrderService
        let marketMakerRepository: MarketMakerRepository
        let treasuryService: TreasuryService
        let mintService: MintService

        const assetId = 'card::testehed'
        let marketMaker: IMarketMaker

        before(async () => {
            const saveLoggerLevel = log4js.getLogger().level
            log4js.getLogger().level = 'error'

            userRepository = new UserRepository()
            assetRepository = new AssetRepository()
            marketMakerRepository = new MarketMakerRepository()
            leagueRepository = new LeagueRepository()
            portfolioOrderRepository = new PortfolioOrderRepository()
            portfolioRepository = new PortfolioRepository()
            transactionRepository = new TransactionRepository()

            bootstrapper = new BootstrapService(
                assetRepository,
                portfolioRepository,
                transactionRepository,
                userRepository,
                marketMakerRepository,
                leagueRepository,
            )
            assetService = new AssetFactory(
                assetRepository,
                portfolioRepository,
                marketMakerRepository,
                transactionRepository,
            )
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
                portfolioOrderRepository,
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
            )
            mintService = new MintService(assetRepository, portfolioRepository, transactionRepository)

            logger.trace('-----bootstrap start----------')
            await bootstrapper.bootstrap()
            await treasuryService.mintUnits(900)
            await mintService.mintUnits(assetId, 90)
            await treasuryService.depositCoins('testbot', 80)
            logger.trace('-----bootstrap finished--------------')
            log4js.getLogger().level = saveLoggerLevel
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

                    await exchangeService.processNewExchangeOrderEvent(orderPayload)

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
