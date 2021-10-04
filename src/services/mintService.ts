'use strict'

import { ValidatorResult } from 'jsonschema'
import * as log4js from 'log4js'
import {
    AssetRepository,
    PortfolioRepository,
    NotFoundError,
    TTransfer,
    TransactionRepository,
    TransactionService,
    //Principal
} from '..'
const logger = log4js.getLogger('MintService')

const MINT_PORTFOLIO = 'bank::mint'

export class MintService {
    private assetRepository: AssetRepository
    private portfolioRepository: PortfolioRepository
    private transactionService: TransactionService
    //private me: Principal

    constructor(
        assetRepository: AssetRepository,
        portfolioRepository: PortfolioRepository,
        transactionRepository: TransactionRepository,
    ) {
        //this.me = me

        this.assetRepository = assetRepository
        this.portfolioRepository = portfolioRepository
        this.transactionService = new TransactionService(assetRepository, portfolioRepository, transactionRepository)
    }

    async mintUnits(assetId: string, units: number, value: number) {
        const asset = await this.assetRepository.getDetailAsync(assetId)
        if (!asset) {
            const msg = `Cannot deposit to asset: ${assetId} does not exist`
            logger.error(msg)
            throw new NotFoundError(msg, { userId: assetId })
        }

        const portfolioId = asset.portfolioId
        if (!portfolioId) {
            const msg = `Cannot deposit to asset: no portfolioId`
            logger.error(msg)
            throw new NotFoundError(msg, { userId: assetId })
        }

        const portfolio = await this.portfolioRepository.getDetailAsync(portfolioId)
        if (!portfolio) {
            const msg = `Cannot deposit to portfolio: ${portfolioId} does not exist`
            logger.error(msg)
            throw new NotFoundError(msg, { portfolioId })
        }

        const sourcePortfolioId = MINT_PORTFOLIO

        const data: TTransfer = {
            inputPortfolioId: sourcePortfolioId,
            outputPortfolioId: portfolioId,
            assetId: assetId,
            units: units,
            value: value,
            tags: {
                source: 'MintUnits',
            },
        }

        await this.transactionService.executeTransferAsync(data)

        this.assetRepository.addMinted(assetId, units)
    }

    async burnUnits(assetId: string, units: number, value: number) {
        const asset = await this.assetRepository.getDetailAsync(assetId)
        if (!asset) {
            const msg = `Cannot deposit to asset: ${assetId} does not exist`
            logger.error(msg)
            throw new NotFoundError(msg, { userId: assetId })
        }

        const portfolioId = asset.portfolioId
        if (!portfolioId) {
            const msg = `Cannot deposit to asset: no portfolioId`
            logger.error(msg)
            throw new NotFoundError(msg, { userId: assetId })
        }

        const portfolio = await this.portfolioRepository.getDetailAsync(portfolioId)
        if (!portfolio) {
            const msg = `Cannot deposit to portfolio: ${portfolioId} does not exist`
            logger.error(msg)
            throw new NotFoundError(msg, { portfolioId })
        }

        const sourcePortfolioId = MINT_PORTFOLIO

        const data: TTransfer = {
            inputPortfolioId: portfolioId,
            outputPortfolioId: sourcePortfolioId,
            assetId: assetId,
            units: units,
            value: value,
            tags: {
                source: 'Burn',
            },
        }
        await this.transactionService.executeTransferAsync(data)

        this.assetRepository.addBurned(assetId, units)
    }
}
