'use strict'
/* eslint-env node, mocha */

import { expect } from 'chai'
import {
    AssetRepository,
    AssetFactory,
    BootstrapService,
    MarketMakerRepository,
    MarketMakerFactory,
    PortfolioRepository,
    TNewMarketMakerConfig,
    TransactionRepository,
    Scrubber,
    IMarketMakerService,
} from '../../../src'

describe('MarketMakerFactory', () => {
    describe('persist marketMaker', function () {
        this.timeout(30000)

        let assetRepository = new AssetRepository()
        let transactionRepository = new TransactionRepository()
        let portfolioRepository = new PortfolioRepository()
        let marketMakerRepository = new MarketMakerRepository()
        let assetFactory: AssetFactory
        let marketMakerFactory: MarketMakerFactory
        const scrubber = new Scrubber({ assetRepository, portfolioRepository })

        const assetId = 'card::testehed'
        let marketMakerService: IMarketMakerService

        before(async () => {
            assetFactory = new AssetFactory(assetRepository, portfolioRepository)
            marketMakerFactory = new MarketMakerFactory(
                assetRepository,
                portfolioRepository,
                transactionRepository,
                marketMakerRepository,
            )
            await BootstrapService.boot()
        })

        describe('buy', () => {
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

                marketMakerService = await marketMakerFactory.createMarketMaker(makerConfig, false)
                expect(marketMakerService).to.exist
            })

            // TODO: Need to generate exchange order (retired generatOrder from order source)
            // describe('Create Basic MarketMaker', async () => {
            //     it('should create', async () => {
            //         const order = MarketMakerFactory.generateOrder({
            //             // operation: 'order',
            //             orderType: 'market',
            //             assetId: assetId,
            //             sourceOrderId: 'order1',
            //             portfolioId: `asset::${assetId}`,
            //             orderSide: 'bid',
            //             orderSize: 4,
            //         })

            //         await marketMakerService.processOrder(order)

            //         const readBack = await marketMakerRepository.getDetailAsync(assetId)
            //         if (readBack) {
            //             expect(readBack?.quote?.last?.side).eq('bid')
            //             expect(readBack?.quote?.last?.units).eq(4)
            //             expect(readBack?.quote?.last?.value).eq(12)
            //             expect(readBack?.quote?.last?.unitValue).eq(3)
            //             expect(readBack.params.madeUnits).eq(4)
            //             expect(readBack.params.cumulativeValue).eq(12)
            //         } else {
            //             expect.fail('nothing read back')
            //         }
            //     })
            // })
        })

        describe('buy2', () => {
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

                marketMakerService = await marketMakerFactory.createMarketMaker(makerConfig, false)
                expect(marketMakerService).to.exist
            })

            // TODO: Need to generate exchange order (retired generatOrder from order source)
            // describe('Create Basic MarketMaker', async () => {
            //     it('should create', async () => {
            //         const order = MarketMakerFactory.generateOrder({
            //             // operation: 'order',
            //             orderType: 'market',
            //             assetId: assetId,
            //             sourceOrderId: 'order1',
            //             portfolioId: `asset::${assetId}`,
            //             orderSide: 'ask',
            //             orderSize: 2,
            //         })

            //         await marketMakerService.processOrder(order)

            //         const readBack = await marketMakerRepository.getDetailAsync(assetId)
            //         if (readBack) {
            //             expect(readBack?.quote?.last?.side).eq('ask')
            //             expect(readBack?.quote?.last?.units).eq(2)
            //             expect(readBack?.quote?.last?.value).eq(8)
            //             expect(readBack?.quote?.last?.unitValue).eq(4)

            //             expect(readBack.params.madeUnits).eq(2)
            //             expect(readBack.params.cumulativeValue).eq(4)
            //         } else {
            //             expect.fail('nothing read back')
            //         }
            //     })
            // })
        })
    })
})
