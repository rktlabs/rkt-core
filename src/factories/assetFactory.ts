'use strict'

import {
    PortfolioRepository,
    AssetRepository,
    TNewAssetConfig,
    DuplicateError,
    ConflictError,
    Asset,
    PortfolioFactory,
} from '..'

import * as log4js from 'log4js'
const logger = log4js.getLogger('assetFactory')

export class AssetFactory {
    private portfolioRepository: PortfolioRepository
    private assetRepository: AssetRepository
    private portfolioService: PortfolioFactory

    constructor(assetRepository: AssetRepository, portfolioRepository: PortfolioRepository) {
        this.assetRepository = assetRepository
        this.portfolioRepository = portfolioRepository
        this.portfolioService = new PortfolioFactory(portfolioRepository)
    }

    async createAsset(payload: TNewAssetConfig, shouldCreatePortfolio: boolean = true) {
        //logger.trace("start createAsset", payload)
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

        const asset = await this._createAssetImpl(payload, shouldCreatePortfolio)

        logger.trace(`created asset: ${asset.assetId}`)

        return asset
    }

    ////////////////////////////////////////////////////////
    // PRIVATE
    ////////////////////////////////////////////////////////

    private async _createAssetImpl(payload: TNewAssetConfig, shouldCreatePortfolio: boolean) {
        const assetDisplayName = payload.displayName

        const asset = Asset.newAsset(payload)

        if (shouldCreatePortfolio) {
            const portfolioId = await this._createAssetPortfolioImpl(asset, `${assetDisplayName} value portfolio`)
            asset.portfolioId = portfolioId
        }

        await this.assetRepository.storeAsync(asset)

        return asset
    }

    private async _createAssetPortfolioImpl(asset: Asset, displayName: string) {
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
