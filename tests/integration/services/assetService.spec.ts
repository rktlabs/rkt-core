'use strict'
/* eslint-env node, mocha */

import { assert, expect } from 'chai'
import { AssetRepository, PortfolioRepository, AssetFactory, TNewAssetConfig, Scrubber } from '../../../src'

describe('Asset Service', function () {
    this.timeout(30000)

    let assetRepository: AssetRepository = new AssetRepository()
    let portfolioRepository: PortfolioRepository = new PortfolioRepository()
    let assetFactory: AssetFactory
    const scrubber = new Scrubber({ assetRepository, portfolioRepository })
    const assetId = 'card::test1'

    before(async () => {
        assetFactory = new AssetFactory(assetRepository, portfolioRepository)

        const readBack = await assetRepository.getDetailAsync(assetId)
    })

    beforeEach(async () => {
        await scrubber.scrubAsset(assetId)
    })

    describe('Create Basic Asset - no portfolio', async () => {
        it('should create', async () => {
            const data: TNewAssetConfig = {
                ownerId: 'tester',
                symbol: assetId,
                displayName: 'display-me',
                leagueId: 'theLeagueId',
                leagueDisplayName: 'theLeagueDisplayName',
            }

            await assetFactory.createAsset(data)

            const readBack = await assetRepository.getDetailAsync(assetId)
            expect(readBack).to.exist
        })
    })

    describe('Create Basic Asset - with portfolio', () => {
        it('should create', async () => {
            const data: TNewAssetConfig = {
                ownerId: 'tester',
                symbol: assetId,
                displayName: 'display-me',
                leagueId: 'theLeagueId',
                leagueDisplayName: 'theLeagueDisplayName',
            }

            await assetFactory.createAsset(data, true)

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
            const data: TNewAssetConfig = {
                ownerId: 'tester',
                symbol: assetId,
                displayName: 'display-me',
                leagueId: 'theLeagueId',
                leagueDisplayName: 'theLeagueDisplayName',
            }

            await assetFactory.createAsset(data)
            const readBack = await assetRepository.getDetailAsync(assetId)
            expect(readBack).to.exist

            await assetFactory
                .createAsset(data)
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
