'use strict'

import { PortfolioService, AssetHolderService, MarketMakerService } from '.'
import {
    PortfolioRepository,
    AssetRepository,
    TNewAssetConfig,
    DuplicateError,
    ConflictError,
    Asset,
    TransactionRepository,
} from '..'

import * as log4js from 'log4js'
const logger = log4js.getLogger()

export class AssetService {
    private portfolioRepository: PortfolioRepository
    private assetRepository: AssetRepository

    private portfolioService: PortfolioService
    private marketMakerService: MarketMakerService
    private assetHolderService: AssetHolderService

    constructor(
        assetRepository: AssetRepository,
        portfolioRepository: PortfolioRepository,
        transactionRepository: TransactionRepository,
    ) {
        this.assetRepository = assetRepository
        this.portfolioRepository = portfolioRepository

        this.assetHolderService = new AssetHolderService(this.assetRepository)
        this.portfolioService = new PortfolioService(portfolioRepository)
        this.marketMakerService = new MarketMakerService(assetRepository, portfolioRepository, transactionRepository)
    }

    async createAsset(payload: TNewAssetConfig, shouldCreatePortfolio: boolean = true) {
        const assetId = payload.symbol
        if (assetId) {
            const asset = await this.assetRepository.getDetailAsync(assetId)
            if (asset) {
                const msg = `Asset Creation Failed - assetId: ${assetId} already exists`
                logger.error(msg)
                throw new DuplicateError(msg, { assetId })
            }

            // check for existence of asset portfolio (shouldn't exist if asset doesn't exist)
            if (shouldCreatePortfolio) {
                const portfolioId = `asset::${assetId}`
                if (portfolioId) {
                    const portfolio = await this.portfolioRepository.getDetailAsync(portfolioId)
                    if (portfolio) {
                        const msg = `Asset Creation Failed - portfolioId: ${portfolioId} already exists`
                        logger.error(msg)
                        throw new ConflictError(msg, { portfolioId })
                    }
                }
            }
        }

        const asset = await this.createAssetImpl(payload, shouldCreatePortfolio)

        logger.info(`created asset: ${asset.assetId}`)

        return asset
    }

    async deleteAsset(assetId: string) {
        logger.trace(`delete asset: ${assetId}`)
        await this.scrubAsset(assetId)
    }

    async scrubAsset(assetId: string) {
        await this.assetHolderService.scrubAssetHolders(assetId)

        await this.portfolioService.scrubPortfolio(`asset::${assetId}`)

        await this.marketMakerService.scrubMarketMaker(assetId)

        await this.assetRepository.deleteAsync(assetId)
    }

    ////////////////////////////////////////////////////////
    // PRIVATE
    ////////////////////////////////////////////////////////

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
        }

        const portfolio = await this.portfolioService.createPortfolio(assetPortfolioDef)
        return portfolio.portfolioId
    }
}
