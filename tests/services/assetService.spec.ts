'use strict'
/* eslint-env node, mocha */

import { assert, expect } from 'chai'
import * as sinon from 'sinon'
import { AssetRepository, PortfolioRepository, AssetService, TNewAsset } from '../../src'
import { BootstrapService } from '../../src/maint/bootstrapService'

describe('Asset Service', function () {
    this.timeout(5000)

    let assetRepository: AssetRepository
    let portfolioRepository: PortfolioRepository
    let assetService: AssetService
    let bootstrapper: BootstrapService
    let assetId: string = 'card::test1'

    before(async () => {
        assetRepository = new AssetRepository()
        portfolioRepository = new PortfolioRepository()

        assetService = new AssetService()

        bootstrapper = new BootstrapService()
        //await bootstrapper.clearDb()
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
                leagueId: 'theLeagueId',
                leagueDisplayName: 'theLeagueDisplayName',
            }

            await assetService.newAsset(data)

            const readBack = await assetRepository.getDetailAsync(assetId)
            expect(readBack).to.exist
        })
    })

    describe('Create Basic Asset - with portfolio', () => {
        it('should create', async () => {
            const data: TNewAsset = {
                ownerId: 'tester',
                symbol: assetId,
                displayName: 'display-me',
                leagueId: 'theLeagueId',
                leagueDisplayName: 'theLeagueDisplayName',
            }

            await assetService.newAsset(data, true)

            const readBack = await assetRepository.getDetailAsync(assetId)
            expect(readBack).to.exist

            const portfolioId = readBack!!.portfolioId
            expect(portfolioId).to.exist

            const portfolio = await portfolioRepository.getDetailAsync(portfolioId!!)
            expect(portfolio).to.exist
        })
    })

    describe('Create Asset where already exists', () => {
        it('should create new portfolio', async () => {
            const data: TNewAsset = {
                ownerId: 'tester',
                symbol: assetId,
                displayName: 'display-me',
                leagueId: 'theLeagueId',
                leagueDisplayName: 'theLeagueDisplayName',
            }

            await assetService.newAsset(data)
            const readBack = await assetRepository.getDetailAsync(assetId)
            expect(readBack).to.exist

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
