'use strict'
/* eslint-env node, mocha */

import { assert, expect } from 'chai'
import * as sinon from 'sinon'
import { EventPublisher } from '../../src/services'

import * as firebase from 'firebase-admin'

import { AssetService, BootstrapService } from '../../src/services'
import { AssetRepository, PortfolioRepository } from '../../src/repositories'
import { AssetCache, PortfolioCache } from '../../src/caches'
import { TNewAsset } from '../../src'

describe('Asset Service', function () {
    this.timeout(5000)

    let assetRepository: AssetRepository
    let portfolioRepository: PortfolioRepository
    let portfolioCache: PortfolioCache
    let assetCache: AssetCache
    let assetService: AssetService
    let bootstrapper: BootstrapService
    let eventPublisher: sinon.SinonStubbedInstance<EventPublisher>
    let assetId: string = 'card::test1'

    before(async () => {
        const db = firebase.firestore()
        eventPublisher = sinon.createStubInstance(EventPublisher)

        assetRepository = new AssetRepository(db)
        portfolioRepository = new PortfolioRepository(db)
        portfolioCache = new PortfolioCache(db)
        assetCache = new AssetCache(db)

        assetService = new AssetService(db, eventPublisher as any as EventPublisher)

        bootstrapper = new BootstrapService(db, eventPublisher as any as EventPublisher)
        await bootstrapper.clearDb()
        await bootstrapper.bootstrap()
    })

    beforeEach(async () => {
        await assetService.scrubAsset(assetId)
        sinon.resetHistory()
    })

    afterEach(async () => {})

    after(async () => {
        await Promise.all([assetService.scrubAsset(assetId)])
    })

    describe('Create Basic Asset - no portfolio', () => {
        it('should create', async () => {
            const data: TNewAsset = {
                ownerId: 'tester',
                symbol: assetId,
                displayName: 'display-me',
                contractId: 'theContractId',
                contractDisplayName: 'theContractDisplayName',
                earnerId: 'theEarnerId',
                earnerDisplayName: 'theEarnerDisplayName',
            }

            await assetService.newAsset(data)

            const readBack = await assetRepository.getAsset(assetId)
            expect(readBack).to.exist

            const cacheBack = await assetCache.lookupAsset(assetId)
            expect(cacheBack).to.exist

            //expect(eventPublisher.publishAssetNewEventAsync.callCount).to.eq(1)
        })
    })

    describe('Create Basic Asset - with portfolio', () => {
        it('should create', async () => {
            const data: TNewAsset = {
                ownerId: 'tester',
                symbol: assetId,
                displayName: 'display-me',
                contractId: 'theContractId',
                contractDisplayName: 'theContractDisplayName',
                earnerId: 'theEarnerId',
                earnerDisplayName: 'theEarnerDisplayName',
            }

            await assetService.newAsset(data, true)

            const readBack = await assetRepository.getAsset(assetId)
            expect(readBack).to.exist

            const cacheBack = await assetCache.lookupAsset(assetId)
            expect(cacheBack).to.exist

            const portfolioId = readBack!!.portfolioId
            expect(portfolioId).to.exist
            expect(cacheBack!!.portfolioId).to.eq(portfolioId)

            const portfolio = await portfolioRepository.getPortfolio(portfolioId!!)
            expect(portfolio).to.exist

            const cachedPortfolio = await portfolioCache.lookupPortfolio(portfolioId!!)
            expect(cachedPortfolio).to.exist

            //expect(eventPublisher.publishAssetNewEventAsync.callCount).to.eq(1)
        })
    })

    describe('Create Asset where already exists', () => {
        it('should create new portfolio', async () => {
            const data: TNewAsset = {
                ownerId: 'tester',
                symbol: assetId,
                displayName: 'display-me',
                contractId: 'theContractId',
                contractDisplayName: 'theContractDisplayName',
                earnerId: 'theEarnerId',
                earnerDisplayName: 'theEarnerDisplayName',
            }

            await assetService.newAsset(data)
            const readBack = await assetRepository.getAsset(assetId)
            expect(readBack).to.exist

            // should only publish event on first
            //expect(eventPublisher.publishAssetCreateAsync.callCount).to.eq(1)

            await assetService
                .newAsset(data)
                .then(() => {
                    assert.fail('Function should not complete')
                })
                .catch((error: any) => {
                    expect(error).to.be.instanceOf(Error)
                    expect(error.message).to.eq('Asset Creation Failed - assetId: card::test1 already exists')
                })
        })
    })
})
