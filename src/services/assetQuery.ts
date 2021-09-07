import { AssetRepository } from '../repositories/assetRepository'

export class AssetQuery {
    assetRepository: AssetRepository

    constructor() {
        this.assetRepository = new AssetRepository()
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
}
