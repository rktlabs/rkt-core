'use strict'

import * as log4js from 'log4js'
import {
    AssetHolderRepository,
    AssetRepository,
    PortfolioActivityRepository,
    PortfolioHoldingRepository,
    TAssetHolder,
    TAssetHolderUpdateItem,
    TTransaction,
} from '..'
const logger = log4js.getLogger('assetHolderService')

/////////////////////////////
// Public Methods
/////////////////////////////

export class AssetHolderService {
    private assetRepository: AssetRepository
    private portfolioHoldingRepository: PortfolioHoldingRepository
    private portfolioActivityRepository: PortfolioActivityRepository
    private assetHolderRepository: AssetHolderRepository

    constructor(assetRepository: AssetRepository) {
        this.assetRepository = assetRepository
        this.assetHolderRepository = new AssetHolderRepository()
        this.portfolioHoldingRepository = new PortfolioHoldingRepository()
        this.portfolioActivityRepository = new PortfolioActivityRepository()
    }

    async addAssetHolder(assetId: string, portfolioId: string) {
        logger.trace(`addAssetHolder(${assetId}, ${portfolioId})`)
        const asset = await this.assetRepository.getDetailAsync(assetId)
        if (asset) {
            const assetDisplayName = asset.displayName || assetId

            const entity = {
                portfolioId: portfolioId,
                assetId: assetId,
                units: 0,

                displayName: assetDisplayName,
            }

            const assetHolder = {
                portfolioId: portfolioId,
                assetId: assetId,
                units: 0,
            }

            await Promise.all([
                this.portfolioHoldingRepository.storeAsync(portfolioId, assetId, entity),
                this.assetHolderRepository.storeAsync(assetId, portfolioId, assetHolder),
            ])

            return entity
        } else {
            return null
        }
    }

    async proessTransaction(updateSet: TAssetHolderUpdateItem[], transaction: TTransaction) {
        return this.portfolioActivityRepository.atomicUpdateTransactionAsync(updateSet, transaction)
    }

    async scrubPortfolioHoldings(portfolioId: string) {
        const portfolioHoldings = await this.portfolioHoldingRepository.getListAsync(portfolioId)
        const promises: Promise<void>[] = []
        portfolioHoldings.forEach((portfolioHoldings) => {
            const assetId = portfolioHoldings.assetId
            promises.push(this.portfolioHoldingRepository.deleteAsync(portfolioId, assetId))
            promises.push(this.assetHolderRepository.deleteAsync(assetId, portfolioId))
        })
        return Promise.all(promises)
    }

    async scrubAssetHolders(assetId: string) {
        const assetHolders = await this.assetHolderRepository.getListAsync(assetId)
        const promises: Promise<void>[] = []
        assetHolders.forEach((holder) => {
            const portfolioId = holder.portfolioId
            promises.push(this.assetHolderRepository.deleteAsync(assetId, portfolioId))
            promises.push(this.portfolioHoldingRepository.deleteAsync(portfolioId, assetId))
        })
        return Promise.all(promises)
    }

    async deleteAssetHolder(assetId: string, portfolioId: string) {
        const promises = [
            this.assetHolderRepository.deleteAsync(assetId, portfolioId),
            this.portfolioHoldingRepository.deleteAsync(portfolioId, assetId),
        ]

        return Promise.all(promises)
    }

    async deletePortfolioHolding(portfolioId: string, assetId: string) {
        const promises = [
            this.assetHolderRepository.deleteAsync(assetId, portfolioId),
            this.portfolioHoldingRepository.deleteAsync(portfolioId, assetId),
        ]

        return Promise.all(promises)
    }

    async getAssetHoldingTotal(assetId: string) {
        const holders = await this.assetHolderRepository.getListAsync(assetId)
        const total = holders.reduce((acc: number, deposit: TAssetHolder) => {
            return acc + deposit.units
        }, 0)
        return total
    }

    async getAssetHolderBalance(assetId: string, portfolioId: string) {
        const assetHolder = await this.assetHolderRepository.getDetailAsync(assetId, portfolioId)
        if (!assetHolder) {
            return 0
        } else {
            return assetHolder.units
        }
    }

    async getPortfolioHoldingBalance(portfolioId: string, assetId: string) {
        const portfolioHolding = await this.portfolioHoldingRepository.getDetailAsync(portfolioId, assetId)
        if (!portfolioHolding) {
            return 0
        } else {
            return portfolioHolding.units
        }
    }
}
