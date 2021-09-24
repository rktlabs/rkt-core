'use strict'

import { TransactionRepository } from '../repositories/transaction/transactionRepository'

export class TransactionQuery {
    transactionRepository: TransactionRepository

    constructor(transactionRepository: TransactionRepository) {
        this.transactionRepository = transactionRepository
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
