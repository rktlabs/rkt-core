'use strict'
import {
    AssetRepository,
    PortfolioRepository,
    PortfolioService,
    TransactionService,
    IEventPublisher,
    LeagueService,
    PortfolioHoldingsService,
    AssetService,
} from '..'

export class BootstrapService {
    private assetRepository: AssetRepository
    private portfolioRepository: PortfolioRepository

    private assetService: AssetService
    private portfolioService: PortfolioService
    private leagueService: LeagueService
    private portfolioHoldingsService: PortfolioHoldingsService
    private transactionService: TransactionService

    constructor(eventPublisher?: IEventPublisher) {
        this.assetRepository = new AssetRepository()
        this.portfolioRepository = new PortfolioRepository()
        this.assetService = new AssetService()
        this.portfolioService = new PortfolioService()
        this.portfolioHoldingsService = new PortfolioHoldingsService()
        this.leagueService = new LeagueService()
        this.transactionService = new TransactionService(eventPublisher)
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
            this.portfolioHoldingsService.scrubAssetHolders('coin::rkt'),
            this.portfolioHoldingsService.scrubAssetHolders('card::jbone::test'),
        ])
        await Promise.all([
            this.portfolioHoldingsService.scrubPortfolioHoldings('user::hedbot'),
            this.portfolioHoldingsService.scrubPortfolioHoldings('league::test'),
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
