'use strict'

import * as log4js from 'log4js'
import {
    PortfolioFactory,
    LeagueFactory,
    AssetFactory,
    MarketMakerFactory,
    UserFactory,
    TNewMarketMakerConfig,
    AssetRepository,
    PortfolioRepository,
    TransactionRepository,
    UserRepository,
    MarketMakerRepository,
    LeagueRepository,
} from '..'
const logger = log4js.getLogger('bootstrapper')

export class BootstrapService {
    private userService: UserFactory
    private assetService: AssetFactory
    private portfolioService: PortfolioFactory
    private leagueService: LeagueFactory
    private marketMakerService: MarketMakerFactory

    constructor(
        assetRepository: AssetRepository,
        portfolioRepository: PortfolioRepository,
        transactionRepository: TransactionRepository,
        userRepository: UserRepository,
        marketMakerRepository: MarketMakerRepository,
        leagueRepository: LeagueRepository,
    ) {
        this.userService = new UserFactory(portfolioRepository, userRepository)
        this.marketMakerService = new MarketMakerFactory(
            assetRepository,
            portfolioRepository,
            transactionRepository,
            marketMakerRepository,
        )
        this.assetService = new AssetFactory(
            assetRepository,
            portfolioRepository,
            marketMakerRepository,
            transactionRepository,
        )
        this.portfolioService = new PortfolioFactory(portfolioRepository)
        this.leagueService = new LeagueFactory(
            leagueRepository,
            assetRepository,
            portfolioRepository,
            marketMakerRepository,
            transactionRepository,
        )
    }

    async bootRkt() {
        const assetId = 'coin::rkt'
        await this.assetService.scrubAsset(assetId)

        const assetDef = {
            ownerId: 'test',
            symbol: assetId,
            displayName: assetId,
        }

        await this.assetService.createAsset(assetDef)
    }

    async bootBank() {
        const treasuryId = 'bank::treasury'
        const mintId = 'bank::mint'
        await this.portfolioService.scrubPortfolio(treasuryId)

        await this.portfolioService.createOrKeepPortfolio({
            type: 'bank',
            ownerId: 'test',
            portfolioId: treasuryId,
        })

        await this.portfolioService.scrubPortfolio(mintId)
        await this.portfolioService.createOrKeepPortfolio({
            type: 'bank',
            ownerId: 'test',
            portfolioId: mintId,
        })
    }

    async bootLeague() {
        await this.leagueService.scrubLeague('test')

        await this.leagueService.createLeague({
            ownerId: 'test',
            leagueId: 'test',
            tags: {
                test: true,
            },
        })
    }

    async bootUser() {
        const userId = 'testbot'

        await this.userService.scrubUser(userId)

        await this.userService.createUser({
            userId: userId,
            dob: '1963-05-07',
            email: 'testbot@hedbot.com',
            name: 'EJ Testbot',
            username: 'testbot',
            displayName: 'TestBot',
            tags: {
                test: true,
            },
        })
    }

    async bootAsset(assetId: string) {
        const leagueId = 'test'

        await this.assetService.scrubAsset(assetId)

        await this.assetService.createAsset({
            ownerId: 'test',
            symbol: assetId,
            displayName: assetId,
            leagueId: leagueId,
            leagueDisplayName: leagueId,
            tags: {
                test: true,
            },
        })

        await this.leagueService.attachAsset(leagueId, { assetId: assetId, displayName: assetId })

        const makerConfig: TNewMarketMakerConfig = {
            type: 'bondingCurveAMM',
            ownerId: 'test',
            assetId: assetId,
            settings: {
                initMadeUnits: 0,
                initPrice: 1,
                tags: {
                    test: true,
                },
            },
        }

        await this.marketMakerService.createMarketMaker(makerConfig, false)
    }

    async bootAssets() {
        await this.bootAsset('card::testehed')
        await this.bootAsset('card::testjhed')
    }

    async bootstrap() {
        await Promise.all([this.bootRkt(), this.bootBank(), this.bootUser(), this.bootLeague()])
        await Promise.all([this.bootAssets()])
    }
}
