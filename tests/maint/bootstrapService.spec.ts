'use strict'
/* eslint-env node, mocha */

import { expect } from 'chai'
import * as sinon from 'sinon'
import { AssetRepository, EventPublisher, LeagueRepository, PortfolioRepository } from '../../src'
import { BootstrapService } from '../../src/maint/bootstrapService'

describe('Bootstrap Service', function () {
    this.timeout(5000)

    let portfolioRepository: PortfolioRepository
    let assetRepository: AssetRepository
    let leagueRepository: LeagueRepository
    let bootstrapService: BootstrapService

    let eventPublisher: sinon.SinonStubbedInstance<EventPublisher>

    before(async () => {
        eventPublisher = sinon.createStubInstance(EventPublisher)

        portfolioRepository = new PortfolioRepository()
        assetRepository = new AssetRepository()
        leagueRepository = new LeagueRepository()

        bootstrapService = new BootstrapService()
    })

    beforeEach(async () => {
        // await bootstrapService.clearDb()
    })

    describe('Create System League', () => {
        it('should create league and coin', async () => {
            await bootstrapService.bootstrap()

            const [coinAsset, systemPortfolio, testLeague, testPortfolio] = await Promise.all([
                assetRepository.getDetailAsync('coin::rkt'),
                portfolioRepository.getDetailAsync('league::mynt'),
                leagueRepository.getDetailAsync('test'),
                portfolioRepository.getDetailAsync('league::test'),
            ])

            expect(coinAsset).to.exist
            expect(coinAsset?.assetId).to.eq('coin::rkt')

            expect(systemPortfolio).to.exist
            expect(systemPortfolio?.portfolioId).to.eq('league::mynt')

            expect(testLeague).to.exist
            expect(testLeague?.leagueId).to.eq('test')

            expect(testPortfolio).to.exist
            expect(testPortfolio?.portfolioId).to.eq('league::test')
        })
    })

    describe('Create Asset', () => {
        it('should create test asset', async () => {
            await bootstrapService.bootstrap()
            await bootstrapService.setupTestAsset()

            const asset = await assetRepository.getDetailAsync('card::jbone::test')

            expect(asset).to.exist
            expect(asset?.assetId).to.eq('card::jbone::test')
        })
    })

    describe('Create Account', () => {
        it('should create dummy account', async () => {
            await bootstrapService.bootstrap()
            await bootstrapService.setupAccount()

            const portfolio = await portfolioRepository.getDetailAsync('user::hedbot')

            expect(portfolio).to.exist
            expect(portfolio?.portfolioId).to.eq('user::hedbot')
        })
    })

    describe('Full Boot', () => {
        it('should create 3 portfolios, coin, asset, and account', async () => {
            const aaa = sinon.stub(bootstrapService, 'bootstrap')
            const ccc = sinon.stub(bootstrapService, 'setupTestAsset')
            const ddd = sinon.stub(bootstrapService, 'setupAccount')

            await bootstrapService.fullBoot()

            expect(aaa.callCount).to.eq(1)
            expect(ccc.callCount).to.eq(1)
            expect(ddd.callCount).to.eq(1)
        })
    })
})
