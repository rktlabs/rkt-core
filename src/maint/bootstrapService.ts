'use strict'
import {
    AssetRepository,
    //PortfolioRepository,
    PortfolioService,
    //TransactionService,
    IEventPublisher,
    LeagueService,
    AssetHolderService,
    AssetService,
    NullEventPublisher,
    UserService,
} from '..'

export class BootstrapService {
    private assetRepository: AssetRepository
    //private portfolioRepository: PortfolioRepository

    private userService: UserService
    private assetService: AssetService
    private portfolioService: PortfolioService
    private leagueService: LeagueService
    private assetHolderService: AssetHolderService
    //private transactionService: TransactionService
    private eventPublisher: IEventPublisher

    constructor() {
        this.eventPublisher = new NullEventPublisher()
        this.assetRepository = new AssetRepository()
        this.userService = new UserService()
        //this.portfolioRepository = new PortfolioRepository()
        this.assetService = new AssetService()
        this.portfolioService = new PortfolioService()
        this.assetHolderService = new AssetHolderService()
        this.leagueService = new LeagueService()
        //this.transactionService = new TransactionService(this.eventPublisher)
    }

    // bootstrap the system with the "rkt" coin
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
        await this.portfolioService.scrubPortfolio(mintId)

        await this.portfolioService.createOrKeepPortfolio({
            type: 'bank',
            ownerId: 'test',
            portfolioId: treasuryId,
        })

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
        })
    }

    async bootstrap() {
        await Promise.all([this.bootRkt(), this.bootBank(), this.bootLeague(), this.bootUser()])
    }

    async bootTestAsset() {
        const assetId = 'card::jbone'

        this.assetService.scrubAsset(assetId)

        const leagueId = 'test'
        let asset = await this.assetRepository.getDetailAsync(assetId)
        if (!asset) {
            await this.leagueService.createAsset(leagueId, {
                symbol: assetId,
                displayName: assetId,
            })
        }
    }

    // async setupTreasury() {
    //     let portfolio = await this.portfolioRepository.getDetailAsync('bank::treasury')
    //     if (!portfolio) {
    //         await this.portfolioService.createOrKeepPortfolio({
    //             type: 'bank',
    //             ownerId: 'test',
    //             portfolioId: 'bank::treasury',
    //         })
    //     }

    //     await this.transactionService.mintCoinsToPortfolio('bank::treasury', 1000000)
    // }

    async fullBoot() {
        await this.bootstrap()
        await Promise.all([this.bootTestAsset(), this.bootUser()])
    }

    async fullScrub() {
        // scrub asset first. If do all in one promise, then they
        // may trample on one other so do assets and portfolios separately
        await Promise.all([
            this.leagueService.scrubLeague('test'), // scrubs coin too
            this.assetService.scrubAsset('coin::rkt'), // scrubs coin too
        ])
        await Promise.all([this.portfolioService.scrubPortfolio('user::hedbot')])
    }

    async clearHoldings() {
        // scrub asset holders first. If do all in one promise, then they
        // may trample on one other so do assets and portfolios separately
        await Promise.all([
            this.assetHolderService.scrubAssetHolders('coin::rkt'),
            this.assetHolderService.scrubAssetHolders('card::jbone::test'),
        ])
        await Promise.all([
            this.assetHolderService.scrubPortfolioHoldings('user::hedbot'),
            this.assetHolderService.scrubPortfolioHoldings('league::test'),
        ])
    }

    // async clearDb() {
    //     const targets = [
    //         'users',
    //         'portfolios',
    //         'assets',
    //         'makers',
    //         'leagues',
    //         'transactions',
    //         'exchangeOrders',
    //         'exchangeTrades',
    //         'exchangeQuotes',
    //     ]

    //     ////////////////////////////////////////////
    //     // ONLY CLEAR TEST DB
    //     ////////////////////////////////////////////
    //     let db = getConnectionProps()
    //     const promises: any[] = []
    //     targets.forEach((target) => {
    //         const entityRef = db.collection(target)
    //         promises.push(deleteCollection(entityRef))
    //     })

    //     await Promise.all(promises)
    // }
}
