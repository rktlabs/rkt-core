'use strict'

import {
    AssetRepository,
    PortfolioHoldingsRepository,
    PortfolioActivityRepository,
    AssetHoldersRepository,
    TPortfolioHoldingUpdateItem,
    TTransaction,
} from '..'

/////////////////////////////
// Public Methods
/////////////////////////////

export class PortfolioHoldingsService {
    private assetRepository: AssetRepository
    private portfolioHoldingsRepository: PortfolioHoldingsRepository
    private portfolioActivityRepository: PortfolioActivityRepository
    private assetHoldersRepository: AssetHoldersRepository

    constructor() {
        this.assetRepository = new AssetRepository()
        this.portfolioHoldingsRepository = new PortfolioHoldingsRepository()
        this.assetHoldersRepository = new AssetHoldersRepository()
        this.portfolioActivityRepository = new PortfolioActivityRepository()
    }

    async createPortfolioHolding(portfolioId: string, assetId: string) {
        const asset = await this.assetRepository.getDetailAsync(assetId)
        if (asset) {
            const assetDisplayName = asset.displayName || assetId

            const entity = {
                portfolioId: portfolioId,
                assetId: assetId,
                units: 0,

                displayName: assetDisplayName,
                net: 0,
                cost: 0,
            }

            const cache = {
                portfolioId: portfolioId,
                assetId: assetId,
                units: 0,
            }

            await Promise.all([
                this.portfolioHoldingsRepository.storeAsync(portfolioId, assetId, entity),
                this.assetHoldersRepository.storeAsync(assetId, portfolioId, cache),
            ])

            return entity
        } else {
            return null
        }
    }

    async proessTransaction(
        transactionId: string,
        updateSet: TPortfolioHoldingUpdateItem[],
        transaction: TTransaction,
    ) {
        return this.portfolioActivityRepository.atomicUpdateTransactionAsync(transactionId, updateSet, transaction)
    }

    async scrubPortfolioHoldings(portfolioId: string) {
        const portfolioHoldingss = await this.portfolioHoldingsRepository.getListAsync(portfolioId)
        const promises: Promise<void>[] = []
        portfolioHoldingss.forEach((portfolioHoldings) => {
            const assetId = portfolioHoldings.assetId
            promises.push(this.portfolioHoldingsRepository.deleteAsync(portfolioId, assetId))
            promises.push(this.assetHoldersRepository.deleteAsync(assetId, portfolioId))
        })
        return Promise.all(promises)
    }

    async scrubAssetHolders(assetId: string) {
        const assetHolders = await this.assetHoldersRepository.getListAsync(assetId)
        const promises: Promise<void>[] = []
        assetHolders.forEach((holder) => {
            const portfolioId = holder.portfolioId
            promises.push(this.assetHoldersRepository.deleteAsync(assetId, portfolioId))
            promises.push(this.portfolioHoldingsRepository.deleteAsync(portfolioId, assetId))
        })
        return Promise.all(promises)
    }

    async deletePortfolioHolding(portfolioId: string, assetId: string) {
        const promises = [
            this.assetHoldersRepository.deleteAsync(assetId, portfolioId),
            this.portfolioHoldingsRepository.deleteAsync(portfolioId, assetId),
        ]

        return Promise.all(promises)
    }

    async getPortfolioHoldingBalance(portfolioId: string, assetId: string) {
        const par = await this.portfolioHoldingsRepository.getDetailAsync(portfolioId, assetId)
        if (!par) {
            return 0
        } else {
            return par.units
        }
    }
}
