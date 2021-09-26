'use strict'

import { AssetHolderService, MarketMakerService } from '../services'
import {
    PortfolioRepository,
    AssetRepository,
    TNewAssetConfig,
    DuplicateError,
    ConflictError,
    Asset,
    TransactionRepository,
    MarketMakerRepository,
    PortfolioService,
} from '..'

import * as log4js from 'log4js'
const logger = log4js.getLogger('assetService')

export class AssetService {
    private portfolioRepository: PortfolioRepository
    private assetRepository: AssetRepository

    private portfolioService: PortfolioService
    private marketMakerService: MarketMakerService
    private assetHolderService: AssetHolderService

    constructor(
        assetRepository: AssetRepository,
        portfolioRepository: PortfolioRepository,
        marketMakerRepository: MarketMakerRepository,
        transactionRepository: TransactionRepository,
    ) {
        this.assetRepository = assetRepository
        this.portfolioRepository = portfolioRepository

        this.assetHolderService = new AssetHolderService(this.assetRepository)
        this.portfolioService = new PortfolioService(portfolioRepository)
        this.marketMakerService = new MarketMakerService(
            assetRepository,
            portfolioRepository,
            transactionRepository,
            marketMakerRepository,
        )
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

    async deleteAsset(assetId: string) {
        logger.trace(`delete asset: ${assetId}`)
        await this.scrubAsset(assetId)
    }

    async scrubAsset(assetId: string) {
        //logger.trace(`***scrubbing assetHolders ${assetId}`)
        await this.assetHolderService.scrubAssetHolders(assetId)

        //logger.trace(`***scrubbing asset portfolio asset::${assetId}`)
        await this.portfolioService.scrubPortfolio(`asset::${assetId}`)

        //logger.trace(`***scrubbing marketMaker ${assetId}`)
        await this.marketMakerService.scrubMarketMaker(assetId)

        //logger.trace(`***scrubbing asset ${assetId}`)
        await this.assetRepository.deleteAsync(assetId)

        //logger.trace(`***done scrubbing asset`)
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
