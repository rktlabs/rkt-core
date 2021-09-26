'use strict'

import {
    PortfolioRepository,
    AssetRepository,
    MarketMakerRepository,
    LeagueRepository,
    PortfolioActivityRepository,
    PortfolioDepositRepository,
    TNewPortfolioConfig,
    DuplicateError,
    Portfolio,
    TPortfolioUpdate,
    ConflictError,
    TPortfolioDeposit,
    UserRepository,
    AssetHolderService,
} from '..'

import * as log4js from 'log4js'
const logger = log4js.getLogger()

export class PortfolioService {
    private portfolioRepository: PortfolioRepository
    private portfolioDepositRepository: PortfolioDepositRepository

    constructor(portfolioRepository: PortfolioRepository) {
        this.portfolioRepository = portfolioRepository
        this.portfolioDepositRepository = new PortfolioDepositRepository()
    }

    // create new portfolio. Fail if it already exists.
    async createPortfolio(payload: TNewPortfolioConfig) {
        const portfolioId = payload.portfolioId
        if (portfolioId) {
            const existing = await this.portfolioRepository.getDetailAsync(portfolioId)
            if (existing) {
                const msg = `Portfolio Creation Failed - portfolioId: ${portfolioId} already exists`
                logger.error(msg)
                throw new DuplicateError(msg, { portfolioId: portfolioId })
            }
        }

        const portfolio = await this._createUserImpl(payload)

        logger.info(`created portfolio: ${portfolio.portfolioId}`)

        return portfolio
    }

    // ensure that portfolio is created. crate new portfolio if don't exist
    // leave in place anything already there.
    // (used by bootstrapper)
    async createOrKeepPortfolio(payload: TNewPortfolioConfig) {
        if (!payload || !payload.portfolioId) {
            const msg = 'Portfolio Creation Failed - no portfolioId'
            logger.error(msg)
            throw new Error(msg)
        }

        const portfolioId = payload.portfolioId
        let portfolio = await this.portfolioRepository.getDetailAsync(portfolioId)
        if (!portfolio) {
            portfolio = await this._createUserImpl(payload)

            logger.info(`created portfolio: ${portfolio.portfolioId}`)
        }

        return portfolio
    }

    async updatePortfolio(portfolioId: string, payload: TPortfolioUpdate) {
        logger.trace(`update portfolio: ${portfolioId}`)
        return await this.portfolioRepository.updateAsync(portfolioId, payload)
    }

    async deletePortfolio(portfolioId: string) {
        logger.trace(`delete portfolio: ${portfolioId}`)
        const assetRepository = new AssetRepository()
        const marketMakerRepository = new MarketMakerRepository()
        const leagueRepository = new LeagueRepository()
        const userRepository = new UserRepository()

        // check for linked assets
        let assetIds = await assetRepository.isPortfolioUsed(portfolioId)
        if (assetIds) {
            const msg = `Cannot Delete Portfolio. Asset Portfolio in use: ${assetIds}`
            logger.error(msg)
            throw new ConflictError(msg)
        }

        let marketMakerIds = await marketMakerRepository.isPortfolioUsed(portfolioId)
        if (marketMakerIds) {
            const msg = `Cannot Delete Portfolio. MarketMaker Portfolio in use: ${marketMakerIds}`
            logger.error(msg)
            throw new ConflictError(msg)
        }

        let leagueIds = await leagueRepository.isPortfolioUsed(portfolioId)
        if (leagueIds) {
            const msg = `Cannot Delete Portfolio. Portfolio linked to league: ${leagueIds}`
            logger.error(msg)
            throw new ConflictError(msg)
        }

        let userIds = await userRepository.isPortfolioUsed(portfolioId)
        if (userIds) {
            const msg = `Cannot Delete Portfolio. Portfolio linked to user: ${userIds}`
            logger.error(msg)
            throw new ConflictError(msg)
        }

        await this.scrubPortfolio(portfolioId)
    }

    async scrubPortfolio(portfolioId: string) {
        const portfolioActivityRepository = new PortfolioActivityRepository()
        const assetRepository = new AssetRepository()
        const assetHolderService = new AssetHolderService(assetRepository)

        await assetHolderService.scrubPortfolioHoldings(portfolioId)

        await portfolioActivityRepository.scrubCollectionAsync(portfolioId)

        await this.portfolioDepositRepository.scrubAsync(portfolioId)

        await this.portfolioRepository.deleteAsync(portfolioId)
    }

    async recordPortfolioDeposit(deposit: TPortfolioDeposit) {
        logger.trace(`recordPortfolioDeposit: ${deposit.portfolioId}`)
        const portfolioId = deposit.portfolioId

        await this.portfolioDepositRepository.storePortfolioDeposit(portfolioId, deposit)

        const deposits = await this.computePortfolioNetDeposits(portfolioId)

        this.updatePortfolio(portfolioId, { deposits: deposits })
    }

    async computePortfolioNetDeposits(portfolioId: string) {
        logger.trace(`computePortfolioNetDeposits: ${portfolioId}`)
        const deposits = await this.portfolioDepositRepository.getPortfolioDeposits(portfolioId)
        const total = deposits.reduce((acc: number, deposit: TPortfolioDeposit) => {
            return acc + deposit.units
        }, 0)
        return total
    }

    ////////////////////////////////////////////////////////
    // PRIVATE
    ////////////////////////////////////////////////////////

    private async _createUserImpl(payload: TNewPortfolioConfig) {
        const portfolio = Portfolio.newPortfolio(payload)
        await this.portfolioRepository.storeAsync(portfolio)
        return portfolio
    }
}
