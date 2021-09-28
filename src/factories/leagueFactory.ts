'use strict'

import * as log4js from 'log4js'
import { PortfolioFactory, AssetFactory } from '.'
import {
    AssetRepository,
    LeagueRepository,
    PortfolioRepository,
    TNewLeagueConfig,
    DuplicateError,
    ConflictError,
    League,
    TLeagueAssetDef,
    TAssetCore,
    TNewAssetConfig,
} from '..'
const logger = log4js.getLogger('leagueFactory')

export class LeagueFactory {
    private assetRepository: AssetRepository
    private leagueRepository: LeagueRepository
    private portfolioRepository: PortfolioRepository

    private portfolioService: PortfolioFactory
    private assetService: AssetFactory

    constructor(
        leagueRepository: LeagueRepository,
        assetRepository: AssetRepository,
        portfolioRepository: PortfolioRepository,
    ) {
        this.assetRepository = assetRepository
        this.leagueRepository = leagueRepository
        this.portfolioRepository = portfolioRepository

        this.portfolioService = new PortfolioFactory(portfolioRepository)
        this.assetService = new AssetFactory(assetRepository, portfolioRepository)
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

        const league = await this._createLeagueImpl(payload)

        return league
    }

    async deleteLeague(leagueId: string) {
        let ids = await this.assetRepository.isLeagueUsed(leagueId)
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

    async createAsset(leagueSpec: string | League, assetDef: TLeagueAssetDef) {
        const league =
            typeof leagueSpec === 'string' ? await this.leagueRepository.getDetailAsync(leagueSpec) : leagueSpec
        if (!league) {
            throw new Error(`League Not Found: ${leagueSpec}`)
        }

        await this._createAssetImpl(league, assetDef)
    }

    async attachAsset(leagueSpec: string | League, asset: TAssetCore) {
        const league =
            typeof leagueSpec === 'string' ? await this.leagueRepository.getDetailAsync(leagueSpec) : leagueSpec
        if (!league) {
            throw new Error(`League Not Found: ${leagueSpec}`)
        }

        await this._attachAssetToLeague(league, asset)
    }

    async detachAsset(leagueSpec: string | League, assetId: string) {
        const league =
            typeof leagueSpec === 'string' ? await this.leagueRepository.getDetailAsync(leagueSpec) : leagueSpec
        if (!league) {
            throw new Error(`League Not Found: ${leagueSpec}`)
        }

        await this._detachAssetFromLeague(league, assetId)
    }

    ////////////////////////////////////////////////////////
    // PRIVATE
    ////////////////////////////////////////////////////////

    private async _createLeagueImpl(payload: TNewLeagueConfig) {
        const league = League.newLeague(payload)
        const portfolioId = await this._createLeaguePortfolioImpl(league)
        league.portfolioId = portfolioId
        await this.leagueRepository.storeAsync(league)
        return league
    }

    private async _attachAssetToLeague(league: League, asset: TAssetCore) {
        await this.leagueRepository.attachLeagueAsset(league.leagueId, asset)
    }

    private async _detachAssetFromLeague(league: League, assetId: string) {
        await this.leagueRepository.detachLeagueAsset(league.leagueId, assetId)
    }

    private async _createLeaguePortfolioImpl(league: League) {
        const displayName = `${league.displayName} value portfolio`

        const leaguePortfolioDef = {
            type: 'league',
            portfolioId: `league::${league.leagueId}`,
            ownerId: league.ownerId,
            displayName: displayName,
        }

        const portfolio = await this.portfolioService.createPortfolio(leaguePortfolioDef)
        return portfolio.portfolioId
    }

    private async _createAssetImpl(league: League, assetDef: TLeagueAssetDef) {
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
            logger.info(`new asset: ${asset.assetId} `)
            await this._attachAssetToLeague(league, asset)
        } catch (err) {
            logger.error(`create asset error: ${assetConfig.symbol} - ${err}`)
        }
    }
}
