'use strict'
import {
    PortfolioService,
    LeagueService,
    AssetService,
    MarketMakerService,
    UserService,
    TNewMarketMakerConfig,
    AssetRepository,
    PortfolioRepository,
    TransactionRepository,
    UserRepository,
} from '..'

export class BootstrapService {
    private userService: UserService
    private assetService: AssetService
    private portfolioService: PortfolioService
    private leagueService: LeagueService
    private marketMakerService: MarketMakerService

    constructor(
        assetRepository: AssetRepository,
        portfolioRepository: PortfolioRepository,
        transactionRepository: TransactionRepository,
        userRepository: UserRepository,
    ) {
        this.userService = new UserService(portfolioRepository, userRepository)
        this.marketMakerService = new MarketMakerService(assetRepository, portfolioRepository, transactionRepository)
        this.assetService = new AssetService(assetRepository, portfolioRepository, transactionRepository)
        this.portfolioService = new PortfolioService(portfolioRepository)
        this.leagueService = new LeagueService(assetRepository, portfolioRepository, transactionRepository)
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

    async bootAssets() {
        this.bootAsset('card::jbone')
        this.bootAsset('card::mhed')
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

    async bootstrap() {
        await Promise.all([this.bootRkt(), this.bootBank(), this.bootUser(), this.bootLeague()])
    }

    async fullBoot() {
        await this.bootstrap()
    }
}
