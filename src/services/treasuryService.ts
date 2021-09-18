'use strict'

import { DateTime } from 'luxon'
import { IEventPublisher, MintService, NullEventPublisher, PortfolioService, TransactionService } from '.'
import {
    UserRepository,
    PortfolioRepository,
    NotFoundError,
    TPortfolioDeposit,
    TTransfer,
    AssetHolderService,
} from '..'

const BANK_PORTFOLIO = 'bank::treasury'
const COIN = 'coin::rkt'

export class TreasuryService {
    private eventPublisher: IEventPublisher
    private userRepository: UserRepository
    private assetHolderService: AssetHolderService
    private portfolioRepository: PortfolioRepository
    private portfolioService: PortfolioService
    private transactionService: TransactionService
    private mintService: MintService

    constructor(eventPublisher?: IEventPublisher) {
        this.eventPublisher = eventPublisher || new NullEventPublisher()

        this.userRepository = new UserRepository()
        this.portfolioRepository = new PortfolioRepository()
        this.portfolioService = new PortfolioService()
        this.assetHolderService = new AssetHolderService()
        this.transactionService = new TransactionService(this.eventPublisher)
        this.mintService = new MintService()
    }

    async depositCoins(userId: string, units: number, coinId = COIN) {
        const user = await this.userRepository.getDetailAsync(userId)
        if (!user) {
            const msg = `Cannot deposit to user: ${userId} does not exist`
            throw new NotFoundError(msg, { userId })
        }

        const portfolioId = user.portfolioId
        if (!portfolioId) {
            const msg = `Cannot deposit to user: no portfolioId`
            throw new NotFoundError(msg, { userId })
        }

        const portfolio = await this.portfolioRepository.getDetailAsync(portfolioId)
        if (!portfolio) {
            const msg = `Cannot deposit to portfolio: ${portfolioId} does not exist`
            throw new NotFoundError(msg, { portfolioId })
        }

        const sourcePortfolioId = BANK_PORTFOLIO

        // get current treasury balance to make sure adequate funds
        const balance = await this.assetHolderService.getAssetHoldingBalance(coinId, sourcePortfolioId)
        if (balance < units) {
            const delta = balance - units
            this.mintService.mintUnits(coinId, delta)
        }

        const data: TTransfer = {
            inputPortfolioId: sourcePortfolioId,
            outputPortfolioId: portfolioId,
            assetId: coinId,
            units: units,
            tags: {
                source: 'Deposit',
            },
        }
        await this.transactionService.executeTransferAsync(data)

        const createdAt = DateTime.utc().toString()
        const deposit: TPortfolioDeposit = {
            createdAt: createdAt,
            portfolioId: portfolioId,
            assetId: 'currency::usd',
            units: units,
        }
        return this.portfolioService.recordPortfolioDeposit(deposit)
    }

    async withdrawCoins(userId: string, units: number, coinId = COIN) {
        const user = await this.userRepository.getDetailAsync(userId)
        if (!user) {
            const msg = `Cannot deposit to user: ${userId} does not exist`
            throw new NotFoundError(msg, { userId })
        }

        const portfolioId = user.portfolioId
        if (!portfolioId) {
            const msg = `Cannot deposit to user: no portfolioId`
            throw new NotFoundError(msg, { userId })
        }

        const portfolio = await this.portfolioRepository.getDetailAsync(portfolioId)
        if (!portfolio) {
            const msg = `Cannot deposit to portfolio: ${portfolioId} does not exist`
            throw new NotFoundError(msg, { portfolioId })
        }

        const destPortfolioId = BANK_PORTFOLIO

        // get current user balance to make sure adequate units to redeem
        const balance = await this.assetHolderService.getAssetHoldingBalance(coinId, portfolioId)
        if (balance < units) {
            units = balance - units
        }

        const data: TTransfer = {
            inputPortfolioId: portfolioId,
            outputPortfolioId: destPortfolioId,
            assetId: coinId,
            units: units,
            tags: {
                source: 'Withdraw',
            },
        }
        await this.transactionService.executeTransferAsync(data)

        const createdAt = DateTime.utc().toString()
        const deposit: TPortfolioDeposit = {
            createdAt: createdAt,
            portfolioId: portfolioId,
            assetId: 'currency::usd',
            units: -1 * units,
        }
        return this.portfolioService.recordPortfolioDeposit(deposit)
    }
}
