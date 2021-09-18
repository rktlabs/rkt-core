'use strict'

import { DateTime } from 'luxon'
import { IEventPublisher, NullEventPublisher, PortfolioService, TransactionService } from '.'
import { UserRepository, PortfolioRepository, NotFoundError, TPortfolioDeposit, TTransfer } from '..'

const BANK_PORTFOLIO = 'bank::treasury'
const COIN = 'coin::rkt'

const logger = require('log4js').getLogger('transactionHandler')

export class TreasuryService {
    private eventPublisher: IEventPublisher
    private userRepository: UserRepository
    private portfolioRepository: PortfolioRepository
    private portfolioService: PortfolioService
    private transactionService: TransactionService

    constructor(eventPublisher?: IEventPublisher) {
        this.eventPublisher = eventPublisher || new NullEventPublisher()

        this.userRepository = new UserRepository()
        this.portfolioRepository = new PortfolioRepository()
        this.portfolioService = new PortfolioService()
        this.transactionService = new TransactionService(this.eventPublisher)
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

        const sourcePortfolioId = BANK_PORTFOLIO

        const data: TTransfer = {
            inputPortfolioId: portfolioId,
            outputPortfolioId: sourcePortfolioId,
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
