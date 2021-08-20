'use strict'
/* eslint-env node, mocha */

import { expect } from 'chai'
import * as sinon from 'sinon'

import * as firebase from 'firebase-admin'

import { EventPublisher } from '../../src/services'
import { BootstrapService } from '../../src/services'
import { PortfolioRepository, AssetRepository, ContractRepository } from '../../src/repositories'

describe('Bootstrap Service', function () {
    this.timeout(5000)

    let portfolioRepository: PortfolioRepository
    let assetRepository: AssetRepository
    let contractRepository: ContractRepository
    let bootstrapService: BootstrapService

    let eventPublisher: sinon.SinonStubbedInstance<EventPublisher>

    before(async () => {
        const db = firebase.firestore()
        eventPublisher = sinon.createStubInstance(EventPublisher)

        portfolioRepository = new PortfolioRepository(db)
        assetRepository = new AssetRepository(db)
        contractRepository = new ContractRepository(db)

        bootstrapService = new BootstrapService(db, eventPublisher as any as EventPublisher)
    })

    beforeEach(async () => {
        await bootstrapService.clearDb()
    })

    describe('Create System Contract', () => {
        it('should create contract and coin', async () => {
            await bootstrapService.bootstrap()

            const [coinAsset, systemContract, systemPortfolio, testContract, testPortfolio] = await Promise.all([
                assetRepository.getAsset('coin::fantx'),
                contractRepository.getContract('mint'),
                portfolioRepository.getPortfolio('contract::mint'),
                contractRepository.getContract('test'),
                portfolioRepository.getPortfolio('contract::test'),
            ])

            expect(coinAsset).to.exist
            expect(coinAsset?.assetId).to.eq('coin::fantx')

            expect(systemContract).to.exist
            expect(systemContract?.contractId).to.eq('mint')

            expect(systemPortfolio).to.exist
            expect(systemPortfolio?.portfolioId).to.eq('contract::mint')

            expect(testContract).to.exist
            expect(testContract?.contractId).to.eq('test')

            expect(testPortfolio).to.exist
            expect(testPortfolio?.portfolioId).to.eq('contract::test')
        })
    })

    describe('Create Asset', () => {
        it('should create test asset', async () => {
            await bootstrapService.bootstrap()
            await bootstrapService.setupTestAsset()

            const asset = await assetRepository.getAsset('card::jbone::test')

            expect(asset).to.exist
            expect(asset?.assetId).to.eq('card::jbone::test')
        })
    })

    describe('Create Account', () => {
        it('should create dummy account', async () => {
            await bootstrapService.bootstrap()
            await bootstrapService.setupAccount()

            const portfolio = await portfolioRepository.getPortfolio('user::hedbot')

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
