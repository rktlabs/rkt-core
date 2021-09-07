import { AssetRepository } from '../repositories/assetRepository'

export class AssetQuery {
    assetRepository: AssetRepository

    constructor() {
        this.assetRepository = new AssetRepository()
    }

    async getListAsync(qs?: any) {
        return {
            data: await this.assetRepository.listAssets(qs),
        }
    }

    async getDetailAsync(id: string) {
        const assetDetail = await this.assetRepository.getAsset(id)
        return assetDetail
    }
}
