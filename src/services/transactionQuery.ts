import { TransactionRepository } from '../repositories/transaction/transactionRepository'

export class TransactionQuery {
    transactionRepository: TransactionRepository

    constructor() {
        this.transactionRepository = new TransactionRepository()
    }

    async getListAsync(qs?: any) {
        return {
            data: await this.transactionRepository.getListAsync(qs),
        }
    }

    async getDetailAsync(id: string) {
        const transactionDetail = await this.transactionRepository.getDetailAsync(id)
        return transactionDetail
    }
}
