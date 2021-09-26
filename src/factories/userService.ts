'use strict'

import {
    UserRepository,
    PortfolioRepository,
    TNewUserConfig,
    DuplicateError,
    ConflictError,
    User,
    PortfolioService,
} from '..'

import * as log4js from 'log4js'
const logger = log4js.getLogger()

const TREASURY_PORTFOLIO = 'bank::treasury'

export class UserService {
    private userRepository: UserRepository
    private portfolioRepository: PortfolioRepository
    private portfolioService: PortfolioService

    constructor(portfolioRepository: PortfolioRepository, userRepository: UserRepository) {
        this.userRepository = userRepository
        this.portfolioRepository = portfolioRepository
        this.portfolioService = new PortfolioService(portfolioRepository)
    }

    async createUser(payload: TNewUserConfig) {
        const userId = payload.userId
        if (userId) {
            const existing = await this.userRepository.getDetailAsync(userId)
            if (existing) {
                const msg = `Portfolio Creation Failed - userId: ${userId} already exists`
                logger.error(msg)
                throw new DuplicateError(msg, { userId: userId })
            }
        }

        const username = payload.username
        if (username) {
            const existingUser = await this.userRepository.lookupUserByUserNameAsync(username)
            if (existingUser) {
                const msg = `User Creation Failed - username: ${username} already exists`
                logger.error(msg)
                throw new DuplicateError(msg, { username })
            }
        }

        const email = payload.email
        if (email) {
            const existingUser = await this.userRepository.lookupUserByEmailAsync(email)
            if (existingUser) {
                const msg = `User Creation Failed - email: ${email} already exists`
                logger.error(msg)
                throw new DuplicateError(msg, { email })
            }
        }

        if (payload.initialCoins) {
            // check for existence of registry
            const treasuryPortfolioId = TREASURY_PORTFOLIO
            const treasuryPortfolio = await this.portfolioRepository.getDetailAsync(treasuryPortfolioId)
            if (!treasuryPortfolio) {
                const msg = `MarketMaker Creation Failed - treasury portfolioId: ${treasuryPortfolioId} does not exist`
                logger.error(msg)
                throw new ConflictError(msg, { portfolioId: treasuryPortfolioId })
            }
        }

        const user = await this._createUserImpl(payload)

        logger.info(`created user: ${user.userId}`)

        return user
    }

    async deleteUser(userId: string) {
        logger.trace(`deleteUser: ${userId}`)
        this.scrubUser(userId)
    }

    async scrubUser(userId: string) {
        await this.portfolioService.scrubPortfolio(`user::${userId}`)

        await this.userRepository.deleteAsync(userId)
    }

    ////////////////////////////////////////////////////////
    // PRIVATE
    ////////////////////////////////////////////////////////

    private async _createUserImpl(payload: TNewUserConfig) {
        const user = User.newUser(payload)
        const portfolioId = await this._createUserPortfolioImpl(user)
        user.portfolioId = portfolioId

        await this.userRepository.storeAsync(user)

        return user
    }

    private async _createUserPortfolioImpl(user: User) {
        const userPortfolioDef = {
            type: 'user',
            portfolioId: `user::${user.userId}`,
            ownerId: user.userId,
        }

        const portfolio = await this.portfolioService.createPortfolio(userPortfolioDef)
        return portfolio.portfolioId
    }
}
