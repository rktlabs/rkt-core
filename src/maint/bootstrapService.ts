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
    Scrubber,
} from '..'
const logger = log4js.getLogger('BootstrapService')

export class BootstrapService {
    private userFactory: UserFactory
    private assetFactory: AssetFactory
    private portfolioFactory: PortfolioFactory
    private leagueFactory: LeagueFactory
    private marketMakerFactory: MarketMakerFactory
    private scrubber: Scrubber = new Scrubber()

    static async boot() {
        const assetRepository = new AssetRepository()
        const portfolioRepository = new PortfolioRepository()
        const transactionRepository = new TransactionRepository()
        const userRepository = new UserRepository()
        const marketMakerRepository = new MarketMakerRepository()
        const leagueRepository = new LeagueRepository()

        const bootstrapper = new BootstrapService(
            assetRepository,
            portfolioRepository,
            transactionRepository,
            userRepository,
            marketMakerRepository,
            leagueRepository,
        )
        logger.trace('-----bootstrap start----------')
        const saveLoggerLevel = log4js.getLogger().level
        log4js.getLogger().level = 'error'
        await bootstrapper.bootstrap()
        log4js.getLogger().level = saveLoggerLevel
        logger.trace('-----bootstrap finished--------------')
    }

    constructor(
        assetRepository: AssetRepository,
        portfolioRepository: PortfolioRepository,
        transactionRepository: TransactionRepository,
        userRepository: UserRepository,
        marketMakerRepository: MarketMakerRepository,
        leagueRepository: LeagueRepository,
    ) {
        this.userFactory = new UserFactory(portfolioRepository, userRepository)

        this.marketMakerFactory = new MarketMakerFactory(
            assetRepository,
            portfolioRepository,
            transactionRepository,
            marketMakerRepository,
        )
        this.assetFactory = new AssetFactory(assetRepository, portfolioRepository)

        this.portfolioFactory = new PortfolioFactory(portfolioRepository)

        this.leagueFactory = new LeagueFactory(leagueRepository, assetRepository, portfolioRepository)
    }

    async bootRkt() {
        const assetId = 'coin::rkt'
        await this.scrubber.scrubAsset(assetId)

        const assetDef = {
            ownerId: 'test',
            symbol: assetId,
            displayName: assetId,
        }

        await this.assetFactory.createAsset(assetDef)
    }

    async bootBank() {
        const treasuryId = 'bank::treasury'
        const mintId = 'bank::mint'
        await this.scrubber.scrubPortfolio(treasuryId)

        await this.portfolioFactory.createOrKeepPortfolio({
            type: 'bank',
            ownerId: 'test',
            portfolioId: treasuryId,
        })

        await this.scrubber.scrubPortfolio(mintId)
        await this.portfolioFactory.createOrKeepPortfolio({
            type: 'bank',
            ownerId: 'test',
            portfolioId: mintId,
        })
    }

    async bootLeague() {
        await this.scrubber.scrubLeague('test')

        await this.leagueFactory.createLeague({
            ownerId: 'test',
            leagueId: 'test',
            tags: {
                test: true,
            },
        })
    }

    async bootUser() {
        const userId = 'testbot'

        await this.scrubber.scrubUser(userId)

        await this.userFactory.createUser({
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

        await this.scrubber.scrubAsset(assetId)

        await this.assetFactory.createAsset({
            ownerId: 'test',
            symbol: assetId,
            displayName: assetId,
            leagueId: leagueId,
            leagueDisplayName: leagueId,
            tags: {
                test: true,
            },
        })

        await this.leagueFactory.attachAsset(leagueId, { assetId: assetId, displayName: assetId })

        const makerConfig: TNewMarketMakerConfig = {
            type: 'linearBondingCurveAMM',
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

        await this.marketMakerFactory.createMarketMaker(makerConfig, false)
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
