'use strict'
import { PortfolioService, LeagueService, AssetService, MakerService, UserService } from '..'
import { TNewMakerConfig } from '../services/makerService/makers/makerBase/types'

export class BootstrapService {
    private userService: UserService
    private assetService: AssetService
    private portfolioService: PortfolioService
    private leagueService: LeagueService
    private makerService: MakerService

    constructor() {
        this.userService = new UserService()
        this.makerService = new MakerService()
        this.assetService = new AssetService()
        this.portfolioService = new PortfolioService()
        this.leagueService = new LeagueService()
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

    async bootstrap() {
        await Promise.all([this.bootRkt(), this.bootBank(), this.bootLeague(), this.bootUser()])
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

        const makerConfig: TNewMakerConfig = {
            type: 'bondingmaker1',
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

        await this.makerService.createMaker(makerConfig, false)
    }

    async fullBoot() {
        await this.bootstrap()
        await Promise.all([this.bootAssets()])
    }

    // async fullScrub() {
    //     // scrub asset first. If do all in one promise, then they
    //     // may trample on one other so do assets and portfolios separately
    //     await Promise.all([
    //         this.leagueService.scrubLeague('test'), // scrubs coin too
    //     ])
    //     await Promise.all([
    //         this.portfolioService.scrubPortfolio('bank::treasury'), // scrubs coin too
    //         this.portfolioService.scrubPortfolio('bank::mint'), // scrubs coin too
    //     ])
    //     await Promise.all([this.userService.scrubUser('hedbot')])
    //     await Promise.all([
    //         this.assetService.scrubAsset('coin::rkt'), // scrubs coin too
    //     ])
    // }

    // async clearHoldings() {
    //     // scrub asset holders first. If do all in one promise, then they
    //     // may trample on one other so do assets and portfolios separately
    //     await Promise.all([
    //         this.assetHolderService.scrubAssetHolders('coin::rkt'),
    //         this.assetHolderService.scrubAssetHolders('card::jbone::test'),
    //     ])
    //     await Promise.all([
    //         this.assetHolderService.scrubPortfolioHoldings('user::hedbot'),
    //         this.assetHolderService.scrubPortfolioHoldings('league::test'),
    //     ])
    // }

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
