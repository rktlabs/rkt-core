'use strict'

import { PortfolioCache, AssetCache } from '../caches'
import { AssetRepository } from '../repositories'
import { Asset, TNewAsset } from '../models'
import { DuplicateError, ConflictError } from '../errors'
import { PortfolioService, EventPublisher, IEventPublisher, PortfolioAssetService } from '../services'

export class AssetService {
    private eventPublisher: IEventPublisher

    private portfolioCache: PortfolioCache
    private assetCache: AssetCache
    private assetRepository: AssetRepository

    private portfolioService: PortfolioService
    private portfolioAssetService: PortfolioAssetService

    constructor(db: FirebaseFirestore.Firestore, eventPublisher?: IEventPublisher) {
        this.eventPublisher = eventPublisher || new EventPublisher()

        this.assetRepository = new AssetRepository(db)
        this.portfolioCache = new PortfolioCache(db)
        this.assetCache = new AssetCache(db)

        this.portfolioAssetService = new PortfolioAssetService(db, eventPublisher)
        this.portfolioService = new PortfolioService(db, eventPublisher)
    }

    async newAsset(payload: TNewAsset, shouldCreatePortfolio: boolean = false) {
        const assetId = payload.symbol
        if (assetId) {
            const asset = await this.assetCache.lookupAsset(assetId)
            if (asset) {
                const msg = `Asset Creation Failed - assetId: ${assetId} already exists`
                throw new DuplicateError(msg, { assetId })
            }

            // check for existence of asset portfolio (shouldn't exist if asset doesn't exist)
            if (shouldCreatePortfolio) {
                const portfolioId = `asset::${assetId}`
                if (portfolioId) {
                    const portfolio = await this.portfolioCache.lookupPortfolio(portfolioId)
                    if (portfolio) {
                        const msg = `Asset Creation Failed - portfolioId: ${portfolioId} already exists`
                        throw new ConflictError(msg, { portfolioId })
                    }
                }
            }
        }

        const asset = await this.createAssetImpl(payload, shouldCreatePortfolio)

        // if (this.eventPublisher) {
        //     await this.eventPublisher.publishAssetCreateAsync(asset, 'assetService')
        // }

        return asset
    }

    async deleteAsset(assetId: string) {
        await this.portfolioAssetService.scrubAssetHolders(assetId)

        const asset = await this.assetCache.lookupAsset(assetId)
        if (asset) {
            const portfolioId = asset.portfolioId
            await this.assetRepository.deleteAsset(assetId)
            if (portfolioId) {
                await this.portfolioService.deletePortfolio(portfolioId)
            }
        }
    }

    async scrubAsset(assetId: string) {
        await this.portfolioAssetService.scrubAssetHolders(assetId)

        await this.portfolioService.scrubPortfolio(`asset::${assetId}`)

        await this.assetRepository.deleteAsset(assetId)
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

        await this.assetRepository.storeAsset(asset)

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
