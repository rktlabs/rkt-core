'use strict'
import * as firebase from 'firebase-admin'
import {
    AssetRepository,
    PortfolioRepository,
    PortfolioService,
    TransactionService,
    IEventPublisher,
    deleteCollection,
    LeagueService,
    PortfolioHoldingsService,
} from '..'
import { getConnectionProps } from '../repositories/getConnectionProps'

export class BootstrapService {
    private assetRepository: AssetRepository
    private portfolioRepository: PortfolioRepository

    private portfolioService: PortfolioService
    private leagueService: LeagueService
    private portfolioHoldingsService: PortfolioHoldingsService
    private transactionService: TransactionService

    constructor(eventPublisher?: IEventPublisher) {
        this.assetRepository = new AssetRepository()
        this.portfolioRepository = new PortfolioRepository()
        this.portfolioService = new PortfolioService()
        this.portfolioHoldingsService = new PortfolioHoldingsService()
        this.leagueService = new LeagueService()
        this.transactionService = new TransactionService(eventPublisher)
    }

    // bootstrap the system with the "mint" league and the "coin" asset
    async bootMint() {
        const mintLeague = await this.leagueService.newLeague({
            ownerId: 'system',
            leagueId: 'mint',
        })

        // await this.leagueService.newSimpleAsset(mintLeague, 'coin', 'fantx')
    }

    async bootTestLeague() {
        await this.leagueService.newLeague({
            ownerId: 'test',
            leagueId: 'test',
        })
    }

    async bootstrap() {
        await Promise.all([this.bootMint(), this.bootTestLeague()])
    }

    async setupTestAsset() {
        const leagueId = 'test'
        const assetId = 'card::jbone'

        let asset = await this.assetRepository.getDetailAsync(assetId)
        if (!asset) {
            await this.leagueService.newAsset(leagueId, {
                assetId: assetId,
                displayName: assetId,
                initialPrice: 11,
            })
        }
    }

    async setupAccount() {
        let portfolio = await this.portfolioRepository.getDetailAsync('user::hedbot')
        if (!portfolio) {
            await this.portfolioService.createPortfolio({
                type: 'user',
                ownerId: 'test',
                portfolioId: 'user::hedbot',
            })
        }
    }

    async setupTreasury() {
        let portfolio = await this.portfolioRepository.getDetailAsync('bank::treasury')
        if (!portfolio) {
            await this.portfolioService.createPortfolio({
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

    async scrub() {
        // scrub asset first. If do all in one promise, then they
        // may trample on one other so do assets and portfolios separately
        await Promise.all([
            this.leagueService.scrubLeague('test'), // scrubs coin too
            this.leagueService.scrubLeague('mint'), // scrubs coin too
        ])
        await Promise.all([this.portfolioService.scrubPortfolio('user::hedbot')])
    }

    async clearHoldings() {
        // scrub asset holders first. If do all in one promise, then they
        // may trample on one other so do assets and portfolios separately
        await Promise.all([
            this.portfolioHoldingsService.scrubAssetHolders('coin::fantx'),
            this.portfolioHoldingsService.scrubAssetHolders('card::jbone::test'),
        ])
        await Promise.all([
            this.portfolioHoldingsService.scrubPortfolioHoldings('user::hedbot'),
            this.portfolioHoldingsService.scrubPortfolioHoldings('league::mint'),
            this.portfolioHoldingsService.scrubPortfolioHoldings('league::test'),
        ])
    }

    async clearDb() {
        const targets = [
            'earners',
            'portfolios',
            'portfolioCache',
            'assets',
            'assetCache',
            'makers',
            'leagues',
            'transactions',
            'exchangeOrders',
            'exchangeTrades',
            'users',
        ]

        ////////////////////////////////////////////
        // ONLY CLEAR TEST DB
        ////////////////////////////////////////////
        let db = getConnectionProps()
        if (firebase.apps[0]!!.options.databaseURL !== 'https://fantx-test.firebaseio.com') {
            throw new Error('Cannot clear non-test database')
        }

        const promises: any[] = []
        targets.forEach((target) => {
            const entityRef = db.collection(target)
            promises.push(deleteCollection(entityRef))
        })

        await Promise.all(promises)
    }
}
