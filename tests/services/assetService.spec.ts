'use strict'
/* eslint-env node, mocha */

import { assert, expect } from 'chai'
import {
    AssetRepository,
    PortfolioRepository,
    AssetFactory,
    TNewAssetConfig,
    TransactionRepository,
    UserRepository,
    LeagueRepository,
    MarketMakerRepository,
    BootstrapService,
} from '../../src'

describe('Asset Service', function () {
    this.timeout(30000)

    let assetRepository: AssetRepository
    let portfolioRepository: PortfolioRepository
    let assetService: AssetFactory
    let transactionRepository: TransactionRepository
    let userRepository: UserRepository
    let marketMakerRepository: MarketMakerRepository
    let leagueRepository: LeagueRepository
    let bootstrapper: BootstrapService
    const assetId = 'card::test1'

    before(async () => {
        assetRepository = new AssetRepository()
        portfolioRepository = new PortfolioRepository()
        transactionRepository = new TransactionRepository()
        userRepository = new UserRepository()
        leagueRepository = new LeagueRepository()
        marketMakerRepository = new MarketMakerRepository()

        assetService = new AssetFactory(
            assetRepository,
            portfolioRepository,
            marketMakerRepository,
            transactionRepository,
        )

        bootstrapper = new BootstrapService(
            assetRepository,
            portfolioRepository,
            transactionRepository,
            userRepository,
            marketMakerRepository,
            leagueRepository,
        )
        await bootstrapper.bootstrap()
    })

    beforeEach(async () => {
        await assetService.scrubAsset(assetId)
    })

    afterEach(async () => {})

    after(async () => {
        await Promise.all([assetService.scrubAsset(assetId)])
    })

    describe('Create Basic Asset - no portfolio', () => {
        it('should create', async () => {
            const data: TNewAssetConfig = {
                ownerId: 'tester',
                symbol: assetId,
                displayName: 'display-me',
                leagueId: 'theLeagueId',
                leagueDisplayName: 'theLeagueDisplayName',
            }

            await assetService.createAsset(data)

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

            await assetService.createAsset(data, true)

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

            await assetService.createAsset(data)
            const readBack = await assetRepository.getDetailAsync(assetId)
            expect(readBack).to.exist

            await assetService
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
