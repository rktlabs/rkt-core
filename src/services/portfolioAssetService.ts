'use strict'
import { EventPublisher, IEventPublisher } from '.'
import { TPortfolioAssetUpdateItem, TTransaction } from '../models'
import {
    PortfolioAssetRepository,
    AssetRepository,
    AssetHolderRepository,
    PortfolioActivityRepository,
} from '../repositories'

/////////////////////////////
// Public Methods
/////////////////////////////

export class PortfolioAssetService {
    private db: FirebaseFirestore.Firestore
    private eventPublisher: IEventPublisher

    private assetRepository: AssetRepository
    private portfolioAssetRepository: PortfolioAssetRepository
    private portfolioActivityRepository: PortfolioActivityRepository
    private assetHolderRepository: AssetHolderRepository

    constructor(db: FirebaseFirestore.Firestore, eventPublisher?: IEventPublisher) {
        this.db = db
        this.eventPublisher = eventPublisher || new EventPublisher()
        this.assetRepository = new AssetRepository(db)
        this.portfolioAssetRepository = new PortfolioAssetRepository(db)
        this.assetHolderRepository = new AssetHolderRepository(db)
        this.portfolioActivityRepository = new PortfolioActivityRepository(db)
    }

    async newPortfolioAsset(portfolioId: string, assetId: string) {
        const asset = await this.assetRepository.getAsset(assetId)
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
                this.portfolioAssetRepository.storePortfolioAsset(portfolioId, assetId, entity),
                this.assetHolderRepository.storeAssetHolder(assetId, portfolioId, cache),
            ])

            return entity
        } else {
            return null
        }
    }

    async proessTransaction(transactionId: string, updateSet: TPortfolioAssetUpdateItem[], transaction: TTransaction) {
        return this.portfolioActivityRepository.atomicUpdateTransaction(transactionId, updateSet, transaction)
    }

    async scrubPortfolioAssets(portfolioId: string) {
        const portfolioAssets = await this.portfolioAssetRepository.listPortfolioAssets(portfolioId)
        const promises: Promise<void>[] = []
        portfolioAssets.forEach((portfolioAsset) => {
            const assetId = portfolioAsset.assetId
            promises.push(this.portfolioAssetRepository.deletePortfolioAsset(portfolioId, assetId))
            promises.push(this.assetHolderRepository.deleteAssetHolder(assetId, portfolioId))
        })
        return Promise.all(promises)
    }

    async scrubAssetHolders(assetId: string) {
        const assetHolders = await this.assetHolderRepository.listAssetHolders(assetId)
        const promises: Promise<void>[] = []
        assetHolders.forEach((holder) => {
            const portfolioId = holder.portfolioId
            promises.push(this.assetHolderRepository.deleteAssetHolder(assetId, portfolioId))
            promises.push(this.portfolioAssetRepository.deletePortfolioAsset(portfolioId, assetId))
        })
        return Promise.all(promises)
    }

    async scrubPortfolioAsset(portfolioId: string, assetId: string) {
        const promises = [
            this.assetHolderRepository.deleteAssetHolder(assetId, portfolioId),
            this.portfolioAssetRepository.deletePortfolioAsset(portfolioId, assetId),
        ]

        return Promise.all(promises)
    }

    async getPortfolioAssetBalance(portfolioId: string, assetId: string) {
        const par = await this.portfolioAssetRepository.getPortfolioAsset(portfolioId, assetId)
        if (!par) {
            return 0
        } else {
            return par.units
        }
    }
}
