'use strict'

import { PortfolioService } from '.'
import { UserRepository, PortfolioRepository, TNewUserConfig, DuplicateError, ConflictError, User } from '..'

const BANK_PORTFOLIO = 'bank::treasury'
//const COIN = 'coin::rkt'

export class UserService {
    private userRepository: UserRepository
    private portfolioRepository: PortfolioRepository
    private portfolioService: PortfolioService
    // private transactionService: TransactionService

    constructor() {
        this.userRepository = new UserRepository()
        this.portfolioRepository = new PortfolioRepository()
        this.portfolioService = new PortfolioService()
        // this.transactionService = new TransactionService(this.eventPublisher)
    }

    async createUser(payload: TNewUserConfig) {
        const userId = payload.userId
        if (userId) {
            const existing = await this.userRepository.getDetailAsync(userId)
            if (existing) {
                const msg = `Portfolio Creation Failed - userId: ${userId} already exists`
                throw new DuplicateError(msg, { userId: userId })
            }
        }

        const username = payload.username
        if (username) {
            const existingUser = await this.userRepository.lookupUserByUserNameAsync(username)
            if (existingUser) {
                const msg = `User Creation Failed - username: ${username} already exists`
                throw new DuplicateError(msg, { username })
            }
        }

        const email = payload.email
        if (email) {
            const existingUser = await this.userRepository.lookupUserByEmailAsync(email)
            if (existingUser) {
                const msg = `User Creation Failed - email: ${email} already exists`
                throw new DuplicateError(msg, { email })
            }
        }

        if (payload.initialCoins) {
            // check for existence of registry
            const treasuryPortfolioId = BANK_PORTFOLIO
            const treasuryPortfolio = await this.portfolioRepository.getDetailAsync(treasuryPortfolioId)
            if (!treasuryPortfolio) {
                const msg = `Maker Creation Failed - treasury portfolioId: ${treasuryPortfolioId} does not exist`
                throw new ConflictError(msg, { portfolioId: treasuryPortfolioId })
            }
        }

        const user = await this.createUserImpl(payload)

        // if (payload.initialCoins) {
        //     await this.depositCoins(user.userId, payload.initialCoins)
        // }

        return user
    }

    async deleteUser(userId: string) {
        const user = await this.userRepository.getDetailAsync(userId)
        if (user) {
            const portfolioId = user.portfolioId
            await this.userRepository.deleteAsync(userId)
            if (portfolioId) {
                await this.portfolioService.deletePortfolio(portfolioId)
            }
        }
    }

    async scrubUser(userId: string) {
        await this.portfolioService.scrubPortfolio(`user::${userId}`)

        await this.userRepository.deleteAsync(userId)
    }

    // async depositCoins(userId: string, units: number, coinId = COIN) {
    //     const user = await this.userRepository.getDetailAsync(userId)
    //     if (!user) {
    //         const msg = `Cannot deposit to user: ${userId} does not exist`
    //         throw new NotFoundError(msg, { userId })
    //     }

    //     const portfolioId = user.portfolioId
    //     if (!portfolioId) {
    //         const msg = `Cannot deposit to user: no portfolioId`
    //         throw new NotFoundError(msg, { userId })
    //     }

    //     const portfolio = await this.portfolioRepository.getDetailAsync(portfolioId)
    //     if (!portfolio) {
    //         const msg = `Cannot deposit to portfolio: ${portfolioId} does not exist`
    //         throw new NotFoundError(msg, { portfolioId })
    //     }

    //     const sourcePortfolioId = BANK_PORTFOLIO

    //     const data: TTransfer = {
    //         inputPortfolioId: sourcePortfolioId,
    //         outputPortfolioId: portfolioId,
    //         assetId: coinId,
    //         units: units,
    //         tags: {
    //             source: 'Deposit',
    //         },
    //     }
    //     await this.transactionService.newTransferAsync(data)

    //     const createdAt = DateTime.utc().toString()
    //     const deposit: TPortfolioDeposit = {
    //         createdAt: createdAt,
    //         portfolioId: portfolioId,
    //         assetId: 'currency::usd',
    //         units: units,
    //     }
    //     return this.portfolioService.submitPortfolioDeposit(deposit)
    // }

    // async withdrawCoins(userId: string, units: number, coinId = COIN) {
    //     const user = await this.userRepository.getUser(userId)
    //     if (!user) {
    //         const msg = `Cannot deposit to user: ${userId} does not exist`
    //         throw new NotFoundError(msg, { userId })
    //     }

    //     const portfolioId = user.portfolioId
    //     if (!portfolioId) {
    //         const msg = `Cannot deposit to user: no portfolioId`
    //         throw new NotFoundError(msg, { userId })
    //     }

    //     const portfolio = await this.portfolioRepository.getDetailAsync(portfolioId)
    //     if (!portfolio) {
    //         const msg = `Cannot deposit to portfolio: ${portfolioId} does not exist`
    //         throw new NotFoundError(msg, { portfolioId })
    //     }

    //     const sourcePortfolioId = BANK_PORTFOLIO

    //     const data: TTransfer = {
    //         inputPortfolioId: portfolioId,
    //         outputPortfolioId: sourcePortfolioId,
    //         assetId: coinId,
    //         units: units,
    //         tags: {
    //             source: 'Withdraw',
    //         },
    //     }
    //     await this.transactionService.newTransferAsync(data)

    //     const createdAt = DateTime.utc().toString()
    //     const deposit: TPortfolioDeposit = {
    //         createdAt: createdAt,
    //         portfolioId: portfolioId,
    //         assetId: 'currency::usd',
    //         units: -1 * units,
    //     }
    //     return this.portfolioService.submitPortfolioDeposit(deposit)
    // }

    ///////////////////////////////////////////
    // Private Methods
    ///////////////////////////////////////////

    private async createUserImpl(payload: TNewUserConfig) {
        const user = User.newUser(payload)
        const portfolioId = await this.createUserPortfolioImpl(user)
        user.portfolioId = portfolioId

        await this.userRepository.storeAsync(user)

        return user
    }

    private async createUserPortfolioImpl(user: User) {
        const userPortfolioDef = {
            type: 'user',
            portfolioId: `user::${user.userId}`,
            ownerId: user.userId,
        }

        const portfolio = await this.portfolioService.createPortfolio(userPortfolioDef)
        return portfolio.portfolioId
    }
}
