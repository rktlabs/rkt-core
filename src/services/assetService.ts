'use strict'

import { PortfolioService, AssetHolderService, MakerService, LeagueService } from '.'
import {
    PortfolioRepository,
    AssetRepository,
    TNewAssetConfig,
    DuplicateError,
    ConflictError,
    Asset,
    ExchangeOrderRepository,
    TAssetUpdate,
    TAssetUpdate2,
} from '..'

export class AssetService {
    private portfolioRepository: PortfolioRepository
    private assetRepository: AssetRepository

    private portfolioService: PortfolioService
    private makerService: MakerService
    private assetHolderService: AssetHolderService

    constructor() {
        this.assetRepository = new AssetRepository()
        this.portfolioRepository = new PortfolioRepository()

        this.assetHolderService = new AssetHolderService()
        this.portfolioService = new PortfolioService()
        this.makerService = new MakerService()
    }

    async createAsset(payload: TNewAssetConfig, shouldCreatePortfolio: boolean = true) {
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
        await this.assetHolderService.scrubAssetHolders(assetId)

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
        await this.assetHolderService.scrubAssetHolders(assetId)

        await this.portfolioService.scrubPortfolio(`asset::${assetId}`)

        await this.makerService.scrubMaker(assetId)

        await this.assetRepository.deleteAsync(assetId)
    }

    ///////////////////////////////////////////
    // Private Methods
    ///////////////////////////////////////////

    private async createAssetImpl(payload: TNewAssetConfig, shouldCreatePortfolio: boolean) {
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

        const portfolio = await this.portfolioService.createPortfolio(assetPortfolioDef)
        return portfolio.portfolioId
    }
}
