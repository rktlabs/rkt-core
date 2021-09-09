import { AssetHoldersRepository } from '../repositories/asset/assetHoldersRepository'
import { AssetRepository } from '../repositories/asset/assetRepository'

export class AssetQuery {
    assetRepository: AssetRepository
    assetHoldersRepository: AssetHoldersRepository

    constructor() {
        this.assetRepository = new AssetRepository()
        this.assetHoldersRepository = new AssetHoldersRepository()
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
            data: await this.assetHoldersRepository.getListAsync(qs),
        }
    }
}
