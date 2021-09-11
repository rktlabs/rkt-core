'use strict'

import { PortfolioService, PortfolioHoldingsService } from '.'
import { PortfolioRepository, AssetRepository, TNewAsset, DuplicateError, ConflictError, Asset } from '..'

export class AssetService {
    private portfolioRepository: PortfolioRepository
    private assetRepository: AssetRepository

    private portfolioService: PortfolioService
    private portfolioHoldingService: PortfolioHoldingsService

    constructor() {
        this.assetRepository = new AssetRepository()
        this.portfolioRepository = new PortfolioRepository()

        this.portfolioHoldingService = new PortfolioHoldingsService()
        this.portfolioService = new PortfolioService()
    }

    async newAsset(payload: TNewAsset, shouldCreatePortfolio: boolean = false) {
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
        await this.portfolioHoldingService.scrubAssetHolders(assetId)

        await this.portfolioService.scrubPortfolio(`asset::${assetId}`)

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

        // if (this.eventPublisher) {
        //     await this.eventPublisher.publishAssetNewEventAsync(asset, 'assetService')
        // }
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
