import { AssetHolderRepository } from '../repositories/asset/assetHolderRepository'
import { AssetRepository } from '../repositories/asset/assetRepository'

export class AssetQuery {
    assetRepository: AssetRepository
    assetHolderRepository: AssetHolderRepository

    constructor(assetRepository: AssetRepository) {
        this.assetRepository = assetRepository
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

    async getAssetHoldersAsync(qs?: any) {
        return {
            data: await this.assetHolderRepository.getListAsync(qs),
        }
    }
}
