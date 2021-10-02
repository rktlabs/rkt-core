'use strict'

import { ActivityRepository } from '..'
import { AssetHolderRepository } from '../repositories/asset/assetHolderRepository'
import { AssetRepository } from '../repositories/asset/assetRepository'

export class AssetQuery {
    assetRepository: AssetRepository
    activityRepository: ActivityRepository
    assetHolderRepository: AssetHolderRepository

    constructor(assetRepository: AssetRepository) {
        this.assetRepository = assetRepository
        this.activityRepository = new ActivityRepository()
        this.assetHolderRepository = new AssetHolderRepository()
    }

    async getListAsync(qs?: any) {
        return {
            data: await this.assetRepository.getListAsync(qs),
        }
    }

    async getDetailAsync(id: string) {
        const assetDetail = await this.assetRepository.getDetailAsync(id)
        return assetDetail
    }

    async getAssetHoldersAsync(assetId: string, qs?: any) {
        return {
            data: await this.assetHolderRepository.getListAsync(assetId, qs),
        }
    }

    async getAssetHolderDetailAsync(assetId: string, portfolioId: string) {
        return {
            data: await this.assetHolderRepository.getDetailAsync(assetId, portfolioId),
        }
    }

    async getAssetActivityAsync(assetId: string, qs?: any) {
        return {
            data: await this.activityRepository.getAssetListAsync(assetId, qs),
        }
    }
}
