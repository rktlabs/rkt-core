'use strict'

import { IEventPublisher, NullEventPublisher, TransactionService } from '.'
import { AssetRepository, PortfolioRepository, NotFoundError, TTransfer } from '..'

const MINT_PORTFOLIO = 'bank::mint'

export class MintService {
    private eventPublisher: IEventPublisher
    private assetRepository: AssetRepository
    private portfolioRepository: PortfolioRepository
    private transactionService: TransactionService

    constructor(eventPublisher?: IEventPublisher) {
        this.eventPublisher = eventPublisher || new NullEventPublisher()

        this.assetRepository = new AssetRepository()
        this.portfolioRepository = new PortfolioRepository()
        this.transactionService = new TransactionService(this.eventPublisher)
    }

    async mintUnits(assetId: string, units: number) {
        const asset = await this.assetRepository.getDetailAsync(assetId)
        if (!asset) {
            const msg = `Cannot deposit to asset: ${assetId} does not exist`
            throw new NotFoundError(msg, { userId: assetId })
        }

        const portfolioId = asset.portfolioId
        if (!portfolioId) {
            const msg = `Cannot deposit to asset: no portfolioId`
            throw new NotFoundError(msg, { userId: assetId })
        }

        const portfolio = await this.portfolioRepository.getDetailAsync(portfolioId)
        if (!portfolio) {
            const msg = `Cannot deposit to portfolio: ${portfolioId} does not exist`
            throw new NotFoundError(msg, { portfolioId })
        }

        const sourcePortfolioId = MINT_PORTFOLIO

        const data: TTransfer = {
            inputPortfolioId: sourcePortfolioId,
            outputPortfolioId: portfolioId,
            assetId: assetId,
            units: units,
            tags: {
                source: 'Mint',
            },
        }
        await this.transactionService.executeTransferAsync(data)

        this.assetRepository.addMinted(assetId, units)
    }

    async burnUnits(assetId: string, units: number) {
        const asset = await this.assetRepository.getDetailAsync(assetId)
        if (!asset) {
            const msg = `Cannot deposit to asset: ${assetId} does not exist`
            throw new NotFoundError(msg, { userId: assetId })
        }

        const portfolioId = asset.portfolioId
        if (!portfolioId) {
            const msg = `Cannot deposit to asset: no portfolioId`
            throw new NotFoundError(msg, { userId: assetId })
        }

        const portfolio = await this.portfolioRepository.getDetailAsync(portfolioId)
        if (!portfolio) {
            const msg = `Cannot deposit to portfolio: ${portfolioId} does not exist`
            throw new NotFoundError(msg, { portfolioId })
        }

        const sourcePortfolioId = MINT_PORTFOLIO

        const data: TTransfer = {
            inputPortfolioId: portfolioId,
            outputPortfolioId: sourcePortfolioId,
            assetId: assetId,
            units: units,
            tags: {
                source: 'Burn',
            },
        }
        await this.transactionService.executeTransferAsync(data)

        this.assetRepository.addBurned(assetId, units)
    }
}
