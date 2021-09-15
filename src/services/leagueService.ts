'use strict'

import { PortfolioService, AssetService } from '.'
import {
    AssetRepository,
    LeagueRepository,
    PortfolioRepository,
    TNewLeagueConfig,
    DuplicateError,
    ConflictError,
    League,
    TLeagueAssetDef,
    TNewAssetConfig,
    TAssetCore,
} from '..'

export class LeagueService {
    private assetRepository: AssetRepository
    private leagueRepository: LeagueRepository
    private portfolioRepository: PortfolioRepository

    private portfolioService: PortfolioService
    private assetService: AssetService

    constructor() {
        this.assetRepository = new AssetRepository()
        this.leagueRepository = new LeagueRepository()
        this.portfolioRepository = new PortfolioRepository()

        this.portfolioService = new PortfolioService()
        this.assetService = new AssetService()
    }

    async createLeague(payload: TNewLeagueConfig) {
        const leagueId = payload.leagueId

        if (leagueId) {
            // check for existing league with that Id. If exists, then fail out.
            const league = await this.leagueRepository.getDetailAsync(leagueId)
            if (league) {
                const msg = `League Creation Failed - leagueId: ${leagueId} already exists`
                throw new DuplicateError(msg, { leagueId })
            }

            // check for existence of league portfolio (shouldn't exist if league doesn't exist)
            const portfolioId = `league::${leagueId}`
            const portfolio = await this.portfolioRepository.getDetailAsync(portfolioId)
            if (portfolio) {
                const msg = `League Creation Failed - League portfolioId: ${portfolioId} already exists`
                throw new ConflictError(msg, { portfolioId })
            }
        }

        const league = await this.createLeagueImpl(payload)

        return league
    }

    async deleteLeague(leagueId: string) {
        let ids = this.assetRepository.isLeagueUsed(leagueId)
        if (ids) {
            throw new ConflictError(`Cannot Delete Portfolio. Asset Portfolio in use: ${ids}`)
        }

        const league = await this.leagueRepository.getDetailAsync(leagueId)
        if (league) {
            const portfolioId = league.portfolioId
            await this.leagueRepository.deleteAsync(leagueId)
            await this.portfolioService.deletePortfolio(portfolioId)
        }
    }

    async scrubLeague(leagueId: string) {
        // scrub all of the owned assets
        const managedAssetIds = await this.assetRepository.getLeagueAssetsAsync(leagueId)

        const promises: any[] = []
        managedAssetIds.forEach((asset) => {
            promises.push(this.scrubLeagueAsset(leagueId, asset.assetId))
        })

        // scrub the associated portfolio
        const portfolioId = `league::${leagueId}`
        promises.push(this.portfolioService.scrubPortfolio(portfolioId))

        // scrub the contraact
        promises.push(this.leagueRepository.deleteAsync(leagueId))

        await Promise.all(promises)
    }

    async scrubLeagueAsset(leagueId: string, assetId: string) {
        const promises: any[] = []
        promises.push(this.assetService.scrubAsset(assetId))
        promises.push(this.dropAsset(leagueId, assetId))
        return Promise.all(promises)
    }

    async createAsset(leagueSpec: string | League, assetDef: TLeagueAssetDef) {
        const league =
            typeof leagueSpec === 'string' ? await this.leagueRepository.getDetailAsync(leagueSpec) : leagueSpec
        if (!league) {
            throw new Error(`League Not Found: ${leagueSpec}`)
        }

        await this.createAssetImpl(league, assetDef)
    }

    async addAsset(leagueSpec: string | League, asset: TAssetCore) {
        const league =
            typeof leagueSpec === 'string' ? await this.leagueRepository.getDetailAsync(leagueSpec) : leagueSpec
        if (!league) {
            throw new Error(`League Not Found: ${leagueSpec}`)
        }

        await this.addAssetToLeague(league, asset)
    }

    async dropAsset(leagueSpec: string | League, assetId: string) {
        const league =
            typeof leagueSpec === 'string' ? await this.leagueRepository.getDetailAsync(leagueSpec) : leagueSpec
        if (!league) {
            throw new Error(`League Not Found: ${leagueSpec}`)
        }

        await this.dropAssetFromLeague(league, assetId)
    }

    ///////////////////////////////////////////////////////
    // PRIVATE
    ///////////////////////////////////////////////////////

    private async createLeagueImpl(payload: TNewLeagueConfig) {
        const league = League.newLeague(payload)
        const portfolioId = await this.createLeaguePortfolioImpl(league)
        league.portfolioId = portfolioId
        await this.leagueRepository.storeAsync(league)
        return league
    }

    private async addAssetToLeague(league: League, asset: TAssetCore) {
        await this.leagueRepository.addLeagueAsset(league.leagueId, asset)
    }

    private async dropAssetFromLeague(league: League, assetId: string) {
        await this.leagueRepository.dropLeagueAsset(league.leagueId, assetId)
    }

    private async createLeaguePortfolioImpl(league: League) {
        const displayName = `${league.displayName} value portfolio`

        const leaguePortfolioDef = {
            type: 'league',
            portfolioId: `league::${league.leagueId}`,
            ownerId: league.ownerId,
            displayName: displayName,
            tags: {
                source: 'CONTRACT_CREATION',
            },
        }

        const portfolio = await this.portfolioService.createPortfolio(leaguePortfolioDef)
        return portfolio.portfolioId
    }

    private async createAssetImpl(league: League, assetDef: TLeagueAssetDef) {
        const displayName = assetDef.displayName
        const assetSymbol = `${assetDef.symbol}`

        const assetConfig: TNewAssetConfig = {
            ownerId: league.ownerId,
            symbol: assetSymbol,
            displayName: displayName,
            leagueId: league.leagueId,
            leagueDisplayName: league.displayName,
        }

        try {
            const asset = await this.assetService.createAsset(assetConfig)
            console.log(`new asset: ${asset.assetId} `)
            await this.addAssetToLeague(league, asset)
        } catch (err) {
            console.log(`create asset error: ${assetConfig.symbol} - ${err}`)
        }
    }
}
