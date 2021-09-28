'use strict'

import * as log4js from 'log4js'
import {
    AssetRepository,
    PortfolioRepository,
    TransactionRepository,
    UserRepository,
    MarketMakerRepository,
    LeagueRepository,
    deleteCollection,
    AssetHolderRepository,
    PortfolioHoldingRepository,
    PortfolioActivityRepository,
} from '..'
import { getConnectionProps } from '../repositories/getConnectionProps'
const logger = log4js.getLogger('Scrubber')

export class Scrubber {
    db: FirebaseFirestore.Firestore

    assetRepository: AssetRepository
    portfolioRepository: PortfolioRepository
    userRepository: UserRepository

    transactionRepository = new TransactionRepository()
    marketMakerRepository = new MarketMakerRepository()
    leagueRepository = new LeagueRepository()
    assetHolderRepository = new AssetHolderRepository()
    portfolioHoldingRepository = new PortfolioHoldingRepository()
    portfolioActivityRepository = new PortfolioActivityRepository()

    static async scrub() {
        const scrubber = new Scrubber()
        logger.trace('-----scrub start----------')
        const saveLoggerLevel = log4js.getLogger().level
        log4js.getLogger().level = 'error'

        await scrubber.scrub()

        log4js.getLogger().level = saveLoggerLevel
        logger.trace('-----scrub finished--------------')
    }

    constructor(repos: any = {}) {
        this.db = getConnectionProps()
        this.assetRepository = repos.assetRepository || new AssetRepository()
        this.portfolioRepository = repos.portfolioRepository || new PortfolioRepository()
        this.userRepository = repos.userRepository || new UserRepository()
    }

    async scrubTransactionCollectionAsync() {
        const entityRef = this.db.collection('transactions')
        await deleteCollection(entityRef)
    }

    async scrubPortfolioActivityCollectionAsync(portfolioId: string) {
        const entityRef = this.db.collection('portfolios').doc(portfolioId).collection('activity')
        await deleteCollection(entityRef)
    }

    async scrubPortfolioDepositsAsync(portfolioId: string) {
        const entityRef = this.db.collection('portfolios').doc(portfolioId).collection('funding')
        await deleteCollection(entityRef)
    }

    async scrubExchangeOrderCollectionAsync() {
        const entityRef = this.db.collection('exchangeOrders')
        await deleteCollection(entityRef)
    }

    async scrubExchangeTradeCollectionAsync() {
        const entityRef = this.db.collection('exchangeTrades')
        await deleteCollection(entityRef)
    }

    async scrubAssetHolders(assetId: string) {
        const assetHolders = await this.assetHolderRepository.getListAsync(assetId)
        const promises: Promise<void>[] = []
        assetHolders.forEach((holder) => {
            const portfolioId = holder.portfolioId
            promises.push(this.assetHolderRepository.deleteAsync(assetId, portfolioId))
            promises.push(this.portfolioHoldingRepository.deleteAsync(portfolioId, assetId))
        })
        await Promise.all(promises)
    }

    async scrubMarketMaker(assetId: string) {
        const portfolioId = `maker::${assetId}`
        await this.scrubPortfolio(portfolioId)
        await this.marketMakerRepository.deleteAsync(assetId)
    }

    async scrubAsset(assetId: string) {
        await this.scrubAssetHolders(assetId)
        await this.scrubPortfolio(`asset::${assetId}`)
        await this.scrubMarketMaker(assetId)
        await this.assetRepository.deleteAsync(assetId)
    }

    async scrubLeague(leagueId: string) {
        // scrub all of the owned assets
        const managedAssetIds = await this.assetRepository.getLeagueAssetsAsync(leagueId)

        const promises: any[] = []
        managedAssetIds.forEach((asset) => {
            promises.push(this.scrubLeagueAsset(asset.assetId))
        })
        await Promise.all(promises)

        // scrub the associated portfolio
        const portfolioId = `league::${leagueId}`
        await this.scrubPortfolio(portfolioId)
        await this.leagueRepository.deleteAsync(leagueId)
    }

    async scrubLeagueAsset(assetId: string) {
        await this.scrubAsset(assetId)
    }

    async scrubPortfolio(portfolioId: string) {
        await this.scrubPortfolioHoldings(portfolioId)
        await this.scrubPortfolioActivityCollectionAsync(portfolioId)
        await this.scrubPortfolioDepositsAsync(portfolioId)
        await this.portfolioRepository.deleteAsync(portfolioId)
    }

    async scrubUser(userId: string) {
        await this.scrubPortfolio(`user::${userId}`)
        await this.userRepository.deleteAsync(userId)
    }

    async scrubPortfolioHoldings(portfolioId: string) {
        const portfolioHoldings = await this.portfolioHoldingRepository.getListAsync(portfolioId)
        const promises: Promise<void>[] = []
        portfolioHoldings.forEach((portfolioHoldings) => {
            const assetId = portfolioHoldings.assetId
            promises.push(this.portfolioHoldingRepository.deleteAsync(portfolioId, assetId))
            promises.push(this.assetHolderRepository.deleteAsync(assetId, portfolioId))
        })
        await Promise.all(promises)
    }

    async scrubRkt() {
        const assetId = 'coin::rkt'
        await this.scrubAsset(assetId)
    }

    async scrubBank() {
        const treasuryId = 'bank::treasury'
        const mintId = 'bank::mint'
        await this.scrubPortfolio(treasuryId)
        await this.scrubPortfolio(mintId)
    }

    async scrubLeague2() {
        await this.scrubLeague('test')
    }

    async scrubUser2() {
        const userId = 'testbot'
        await this.scrubUser(userId)
    }

    async scrubAsset2(assetId: string) {
        await this.scrubAsset2(assetId)
    }

    async scrubAssets() {
        await this.scrubAsset2('card::testehed')
        await this.scrubAsset2('card::testjhed')
    }

    async scrub() {
        await Promise.all([
            this.scrubRkt(),
            this.scrubBank(),
            this.scrubUser2(),
            this.scrubLeague2(),
            this.scrubAssets(),
        ])
    }
}
