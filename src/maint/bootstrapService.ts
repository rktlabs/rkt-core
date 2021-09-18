'use strict'
import {
    AssetRepository,
    PortfolioRepository,
    PortfolioService,
    TransactionService,
    IEventPublisher,
    LeagueService,
    PortfolioHoldingService,
    AssetService,
    NullEventPublisher,
} from '..'

export class BootstrapService {
    private assetRepository: AssetRepository
    private portfolioRepository: PortfolioRepository

    private assetService: AssetService
    private portfolioService: PortfolioService
    private leagueService: LeagueService
    private portfolioHoldingService: PortfolioHoldingService
    private transactionService: TransactionService
    private eventPublisher: IEventPublisher

    constructor() {
        this.eventPublisher = new NullEventPublisher()
        this.assetRepository = new AssetRepository()
        this.portfolioRepository = new PortfolioRepository()
        this.assetService = new AssetService()
        this.portfolioService = new PortfolioService()
        this.portfolioHoldingService = new PortfolioHoldingService()
        this.leagueService = new LeagueService()
        this.transactionService = new TransactionService(this.eventPublisher)
    }

    // bootstrap the system with the "rkt" coin
    async createRkt() {
        const assetId = 'coin::rkt'
        const assetDef = {
            ownerId: 'test',
            symbol: assetId,
            displayName: assetId,
        }

        await this.assetService.createAsset(assetDef)
    }

    async bootTestLeague() {
        await this.leagueService.createLeague({
            ownerId: 'test',
            leagueId: 'test',
        })
    }

    async bootstrap() {
        await Promise.all([this.createRkt(), this.bootTestLeague()])
    }

    async setupTestAsset() {
        const leagueId = 'test'
        const assetId = 'card::jbone'

        let asset = await this.assetRepository.getDetailAsync(assetId)
        if (!asset) {
            await this.leagueService.createAsset(leagueId, {
                symbol: assetId,
                displayName: assetId,
            })
        }
    }

    async setupAccount() {
        let portfolio = await this.portfolioRepository.getDetailAsync('user::hedbot')
        if (!portfolio) {
            await this.portfolioService.createOrKeepPortfolio({
                type: 'user',
                ownerId: 'test',
                portfolioId: 'user::hedbot',
            })
        }
    }

    async setupTreasury() {
        let portfolio = await this.portfolioRepository.getDetailAsync('bank::treasury')
        if (!portfolio) {
            await this.portfolioService.createOrKeepPortfolio({
                type: 'bank',
                ownerId: 'test',
                portfolioId: 'bank::treasury',
            })
        }

        await this.transactionService.mintCoinsToPortfolio('bank::treasury', 1000000)
    }

    async fullBoot() {
        await this.bootstrap()
        await Promise.all([this.setupTestAsset(), this.setupAccount()])
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
            this.portfolioHoldingService.scrubAssetHolders('coin::rkt'),
            this.portfolioHoldingService.scrubAssetHolders('card::jbone::test'),
        ])
        await Promise.all([
            this.portfolioHoldingService.scrubPortfolioHoldings('user::hedbot'),
            this.portfolioHoldingService.scrubPortfolioHoldings('league::test'),
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
