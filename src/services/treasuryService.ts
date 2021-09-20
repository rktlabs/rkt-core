'use strict'

import { DateTime } from 'luxon'
import { INotificationPublisher, MintService, NullNotificationPublisher, PortfolioService, TransactionService } from '.'
import {
    UserRepository,
    PortfolioRepository,
    NotFoundError,
    TPortfolioDeposit,
    TTransfer,
    AssetHolderService,
    AssetRepository,
    //Principal,
} from '..'

const BANK_PORTFOLIO = 'bank::treasury'
const COIN = 'coin::rkt'

export class TreasuryService {
    private eventPublisher: INotificationPublisher
    private userRepository: UserRepository
    private assetRepository: AssetRepository
    private assetHolderService: AssetHolderService
    private portfolioRepository: PortfolioRepository
    private portfolioService: PortfolioService
    private transactionService: TransactionService
    private mintService: MintService
    //private me: Principal

    constructor(eventPublisher?: INotificationPublisher) {
        //this.me = me
        this.eventPublisher = eventPublisher || new NullNotificationPublisher()

        this.userRepository = new UserRepository()
        this.assetRepository = new AssetRepository()
        this.portfolioRepository = new PortfolioRepository()
        this.portfolioService = new PortfolioService()
        this.assetHolderService = new AssetHolderService()
        this.transactionService = new TransactionService(this.eventPublisher)
        this.mintService = new MintService()
    }

    async mintUnits(units: number) {
        const assetId = COIN
        const asset = await this.assetRepository.getDetailAsync(assetId)
        if (!asset) {
            const msg = `Cannot deposit to asset: ${assetId} does not exist`
            throw new NotFoundError(msg, { assetId: assetId })
        }

        const assetPortfolioId = asset.portfolioId
        if (!assetPortfolioId) {
            const msg = `Cannot deposit to asset: ${assetId} portfolio does not exist`
            throw new NotFoundError(msg, { assetId: assetId })
        }

        // get current treasury balance to make sure adequate funds
        const balance = await this.assetHolderService.getAssetHolderBalance(assetId, assetPortfolioId)
        if (balance < units) {
            const delta = units - balance
            await this.mintService.mintUnits(COIN, delta)
        }

        const portfolioId = BANK_PORTFOLIO
        const portfolio = await this.portfolioRepository.getDetailAsync(portfolioId)
        if (!portfolio) {
            const msg = `Cannot deposit to portfolio: ${portfolioId} does not exist`
            throw new NotFoundError(msg, { portfolioId })
        }

        const data: TTransfer = {
            inputPortfolioId: assetPortfolioId,
            outputPortfolioId: portfolioId,
            assetId: assetId,
            units: units,
            tags: {
                source: 'Mint',
            },
        }
        await this.transactionService.executeTransferAsync(data)
    }

    async depositCoins(userId: string, units: number) {
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
        const assetId = COIN

        // get current treasury balance to make sure adequate funds
        const balance = await this.assetHolderService.getAssetHolderBalance(assetId, sourcePortfolioId)
        if (balance < units) {
            const delta = units - balance
            await this.mintUnits(delta)
        }

        const data: TTransfer = {
            inputPortfolioId: sourcePortfolioId,
            outputPortfolioId: portfolioId,
            assetId: assetId,
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
        const balance = await this.assetHolderService.getAssetHolderBalance(coinId, portfolioId)
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
