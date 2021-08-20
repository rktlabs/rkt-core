import { PortfolioAssetService, EventPublisher, IEventPublisher } from '../services'
import { PortfolioCache } from '../caches'
import { PortfolioRepository, PortfolioActivityRepository, PortfolioDepositRepository } from '../repositories'
import { Portfolio, TNewPortfolio, TPortfolioDeposit, TPortfolioPatch } from '../models'
import { ConflictError, DuplicateError } from '../errors'

export class PortfolioService {
    private db: FirebaseFirestore.Firestore
    private eventPublisher: IEventPublisher

    private portfolioRepository: PortfolioRepository
    private portfolioActivityRepository: PortfolioActivityRepository
    private portfolioDepositRepository: PortfolioDepositRepository
    private portfolioCache: PortfolioCache
    private portfolioAssetService: PortfolioAssetService

    constructor(db: FirebaseFirestore.Firestore, eventPublisher?: IEventPublisher) {
        this.db = db
        this.eventPublisher = eventPublisher || new EventPublisher()
        this.portfolioRepository = new PortfolioRepository(db)
        this.portfolioCache = new PortfolioCache(db)
        this.portfolioActivityRepository = new PortfolioActivityRepository(db)
        this.portfolioDepositRepository = new PortfolioDepositRepository(db)

        this.portfolioAssetService = new PortfolioAssetService(db, eventPublisher)
    }

    // create new portfolio. Fail if it already exists.
    async newPortfolio(payload: TNewPortfolio) {
        const portfolioId = payload.portfolioId
        if (portfolioId) {
            const existing = await this.portfolioCache.lookupPortfolio(portfolioId)
            if (existing) {
                const msg = `Portfolio Creation Failed - portfolioId: ${portfolioId} already exists`
                throw new DuplicateError(msg, { portfolioId: portfolioId })
            }
        }

        const portfolio = Portfolio.newPortfolio(payload)
        await this.portfolioRepository.storePortfolio(portfolio)

        // if (this.eventPublisher) {
        //     await this.eventPublisher.publishPortfolioNewEventAsync(portfolio, 'portfolioService')
        // }
        return portfolio
    }

    // ensure that portfolio is created. crate new portfolio and new cache if don't exist
    // leave in place anything already there.
    async createPortfolio(payload: TNewPortfolio) {
        if (!payload || !payload.portfolioId) {
            throw new Error('Portfolio Creation Failed - no portfolioId')
        }

        const promises: any[] = []

        const portfolioId = payload.portfolioId
        const existing = await this.portfolioRepository.getPortfolio(portfolioId)
        if (!existing) {
            const portfolio = Portfolio.newPortfolio(payload)
            promises.push(this.portfolioRepository.storePortfolio(portfolio))

            // if (this.eventPublisher) {
            //     await this.eventPublisher.publishPortfolioNewEventAsync(portfolio, 'portfolioService')
            // }
        }

        return Promise.all(promises)
    }

    async updatePortfolio(portfolioId: string, payload: TPortfolioPatch) {
        return await this.portfolioRepository.updatePortfolio(portfolioId, payload)
    }

    async deletePortfolio(portfolioId: string) {
        {
            // check for linked assets
            const entityRefCollection = this.db.collection('assets').where('portfolioId', '==', portfolioId)
            const entityCollectionRefs = await entityRefCollection.get()
            if (entityCollectionRefs.size > 0) {
                const assetIds = entityCollectionRefs.docs.map((doc) => {
                    const data = doc.data()
                    return data.assetId
                })
                const assetIdList = assetIds.join(', ')
                throw new ConflictError(`Cannot Delete Portfolio. Asset Portfolio in use: ${assetIdList}`)
            }
        }

        {
            // check for linked makers
            const entityRefCollection = this.db.collection('makers').where('portfolioId', '==', portfolioId)
            const entityCollectionRefs = await entityRefCollection.get()
            if (entityCollectionRefs.size > 0) {
                const assetIds = entityCollectionRefs.docs.map((doc) => {
                    const data = doc.data()
                    return data.assetId
                })
                const assetIdList = assetIds.join(', ')
                throw new ConflictError(`Cannot Delete Portfolio. Maker Portfolio in use: ${assetIdList}`)
            }
        }

        {
            // check for linked contracts
            const entityRefCollection = this.db.collection('contracts').where('portfolioId', '==', portfolioId)
            const entityCollectionRefs = await entityRefCollection.get()
            if (entityCollectionRefs.size > 0) {
                const contractIds = entityCollectionRefs.docs.map((doc) => {
                    const data = doc.data()
                    return data.contractId
                })

                const assetIdList = contractIds.join(', ')
                throw new ConflictError(`Cannot Delete Portfolio. Portfolio linked to contract: ${assetIdList}`)
            }
        }

        await this.portfolioAssetService.scrubPortfolioAssets(portfolioId)

        await this.portfolioActivityRepository.scrubPortfolioActivityCollection(portfolioId)

        await this.portfolioDepositRepository.scrubPortfolioDeposits(portfolioId)

        await this.portfolioRepository.deletePortfolio(portfolioId)
    }

    async scrubPortfolio(portfolioId: string) {
        await this.portfolioAssetService.scrubPortfolioAssets(portfolioId)

        await this.portfolioActivityRepository.scrubPortfolioActivityCollection(portfolioId)

        await this.portfolioDepositRepository.scrubPortfolioDeposits(portfolioId)

        await this.portfolioRepository.deletePortfolio(portfolioId)
    }

    async submitPortfolioDeposit(deposit: TPortfolioDeposit) {
        const portfolioId = deposit.portfolioId

        await this.portfolioDepositRepository.storePortfolioDeposit(portfolioId, deposit)

        const deposits = await this.computePortfolioNetDeposits(portfolioId)

        this.updatePortfolio(portfolioId, { deposits: deposits })
    }

    async computePortfolioNetDeposits(portfolioId: string) {
        const deposits = await this.portfolioDepositRepository.listPortfolioDeposits(portfolioId)
        const total = deposits.reduce((acc: number, deposit: TPortfolioDeposit) => {
            return acc + deposit.units
        }, 0)
        return total
    }
}
