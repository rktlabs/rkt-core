'use strict'

import { PortfolioService, PortfolioHoldingsService, MakerService, LeagueService } from '.'
import { PortfolioRepository, AssetRepository, TNewAsset, DuplicateError, ConflictError, Asset } from '..'

export class AssetService {
    private portfolioRepository: PortfolioRepository
    private assetRepository: AssetRepository

    private portfolioService: PortfolioService
    private leagueService: LeagueService
    private makerService: MakerService
    private portfolioHoldingService: PortfolioHoldingsService

    constructor() {
        this.assetRepository = new AssetRepository()
        this.portfolioRepository = new PortfolioRepository()

        this.portfolioHoldingService = new PortfolioHoldingsService()
        this.portfolioService = new PortfolioService()
        this.leagueService = new LeagueService()
        this.makerService = new MakerService()
    }

    async newAsset(payload: TNewAsset, shouldCreatePortfolio: boolean = true) {
        const assetId = payload.symbol
        if (assetId) {
            const asset = await this.assetRepository.getDetailAsync(assetId)
            if (asset) {
                const msg = `Asset Creation Failed - assetId: ${assetId} already exists`
                throw new DuplicateError(msg, { assetId })
            }

            // check for existence of asset portfolio (shouldn't exist if asset doesn't exist)
            if (shouldCreatePortfolio) {
                const portfolioId = `asset::${assetId}`
                if (portfolioId) {
                    const portfolio = await this.portfolioRepository.getDetailAsync(portfolioId)
                    if (portfolio) {
                        const msg = `Asset Creation Failed - portfolioId: ${portfolioId} already exists`
                        throw new ConflictError(msg, { portfolioId })
                    }
                }
            }
        }

        const asset = await this.createAssetImpl(payload, shouldCreatePortfolio)

        return asset
    }

    async deleteAsset(assetId: string) {
        await this.portfolioHoldingService.scrubAssetHolders(assetId)

        const asset = await this.assetRepository.getDetailAsync(assetId)
        if (asset) {
            const portfolioId = asset.portfolioId
            await this.assetRepository.deleteAsync(assetId)
            if (portfolioId) {
                await this.portfolioService.deletePortfolio(portfolioId)
            }
        }
    }

    async scrubAsset(assetId: string) {
        const asset = await this.assetRepository.getDetailAsync(assetId)
        if (asset) {
            const leagueId = asset.leagueId
            if (leagueId) {
                this.leagueService.dropAsset(leagueId, asset.assetId)
            }
        }

        await this.portfolioHoldingService.scrubAssetHolders(assetId)

        await this.portfolioService.scrubPortfolio(`asset::${assetId}`)

        await this.makerService.scrubMaker(assetId)

        await this.assetRepository.deleteAsync(assetId)
    }

    ///////////////////////////////////////////
    // Private Methods
    ///////////////////////////////////////////

    private async createAssetImpl(payload: TNewAsset, shouldCreatePortfolio: boolean) {
        const assetDisplayName = payload.displayName

        const asset = Asset.newAsset(payload)

        if (shouldCreatePortfolio) {
            const portfolioId = await this.createAssetPortfolioImpl(asset, `${assetDisplayName} value portfolio`)
            asset.portfolioId = portfolioId
        }

        await this.assetRepository.storeAsync(asset)

        return asset
    }

    private async createAssetPortfolioImpl(asset: Asset, displayName: string) {
        const assetPortfolioDef = {
            type: 'asset',
            portfolioId: `asset::${asset.assetId}`,
            ownerId: asset.ownerId,
            displayName: `${displayName}`,
            tags: {
                source: 'ASSET_CREATION',
            },
        }

        const portfolio = await this.portfolioService.newPortfolio(assetPortfolioDef)
        return portfolio.portfolioId
    }
}
