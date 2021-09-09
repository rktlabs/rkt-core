import { MakerRepository } from '../repositories/makerRepository'

export class MakerQuery {
    makerRepository: MakerRepository

    constructor() {
        this.makerRepository = new MakerRepository()
    }

    async getListAsync(qs?: any) {
        return {
            data: await this.makerRepository.getListAsync(qs),
        }
    }

    async getDetailAsync(id: string) {
        const makerDetail = await this.makerRepository.getDetailAsync(id)
        return makerDetail
    }
}
