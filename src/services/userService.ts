'use strict'

import { PortfolioService } from '.'
import { UserRepository, PortfolioRepository, TNewUserConfig, DuplicateError, ConflictError, User } from '..'

const BANK_PORTFOLIO = 'bank::treasury'
const COIN = 'coin::rkt'

const logger = require('log4js').getLogger('transactionHandler')

export class UserService {
    private userRepository: UserRepository
    private portfolioRepository: PortfolioRepository
    private portfolioService: PortfolioService

    constructor() {
        this.userRepository = new UserRepository()
        this.portfolioRepository = new PortfolioRepository()
        this.portfolioService = new PortfolioService()
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
                const msg = `MarketMaker Creation Failed - treasury portfolioId: ${treasuryPortfolioId} does not exist`
                throw new ConflictError(msg, { portfolioId: treasuryPortfolioId })
            }
        }

        const user = await this.createUserImpl(payload)

        return user
    }

    async deleteUser(userId: string) {
        this.scrubUser(userId)
    }

    async scrubUser(userId: string) {
        await this.portfolioService.scrubPortfolio(`user::${userId}`)

        await this.userRepository.deleteAsync(userId)
    }

    ////////////////////////////////////////////////////////
    // PRIVATE
    ////////////////////////////////////////////////////////

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
