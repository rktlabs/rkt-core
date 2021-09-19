'use strict'

import { AssetHolderService } from '.'
import {
    PortfolioRepository,
    AssetRepository,
    MakerRepository,
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
} from '..'

export class PortfolioService {
    private portfolioRepository: PortfolioRepository
    private portfolioDepositRepository: PortfolioDepositRepository

    constructor() {
        this.portfolioRepository = new PortfolioRepository()
        this.portfolioDepositRepository = new PortfolioDepositRepository()
    }

    // create new portfolio. Fail if it already exists.
    async createPortfolio(payload: TNewPortfolioConfig) {
        const portfolioId = payload.portfolioId
        if (portfolioId) {
            const existing = await this.portfolioRepository.getDetailAsync(portfolioId)
            if (existing) {
                const msg = `Portfolio Creation Failed - portfolioId: ${portfolioId} already exists`
                throw new DuplicateError(msg, { portfolioId: portfolioId })
            }
        }

        const portfolio = Portfolio.newPortfolio(payload)
        await this.portfolioRepository.storeAsync(portfolio)

        return portfolio
    }

    // ensure that portfolio is created. crate new portfolio if don't exist
    // leave in place anything already there.
    // (used by bootstrapper)
    async createOrKeepPortfolio(payload: TNewPortfolioConfig) {
        if (!payload || !payload.portfolioId) {
            throw new Error('Portfolio Creation Failed - no portfolioId')
        }

        const promises: any[] = []

        const portfolioId = payload.portfolioId
        const existing = await this.portfolioRepository.getDetailAsync(portfolioId)
        if (!existing) {
            const portfolio = Portfolio.newPortfolio(payload)
            promises.push(this.portfolioRepository.storeAsync(portfolio))
        }

        return Promise.all(promises)
    }

    async updatePortfolio(portfolioId: string, payload: TPortfolioUpdate) {
        return await this.portfolioRepository.updateAsync(portfolioId, payload)
    }

    async deletePortfolio(portfolioId: string) {
        const assetRepository = new AssetRepository()
        const makerRepository = new MakerRepository()
        const leagueRepository = new LeagueRepository()
        const userRepository = new UserRepository()

        // check for linked assets
        let assetIds = await assetRepository.isPortfolioUsed(portfolioId)
        if (assetIds) {
            throw new ConflictError(`Cannot Delete Portfolio. Asset Portfolio in use: ${assetIds}`)
        }

        let makerIds = await makerRepository.isPortfolioUsed(portfolioId)
        if (makerIds) {
            throw new ConflictError(`Cannot Delete Portfolio. Maker Portfolio in use: ${makerIds}`)
        }

        let leagueIds = await leagueRepository.isPortfolioUsed(portfolioId)
        if (leagueIds) {
            throw new ConflictError(`Cannot Delete Portfolio. Portfolio linked to league: ${leagueIds}`)
        }

        let userIds = await userRepository.isPortfolioUsed(portfolioId)
        if (userIds) {
            throw new ConflictError(`Cannot Delete Portfolio. Portfolio linked to user: ${userIds}`)
        }

        await this.scrubPortfolio(portfolioId)
    }

    async scrubPortfolio(portfolioId: string) {
        const portfolioActivityRepository = new PortfolioActivityRepository()
        const assetHolderService = new AssetHolderService()

        await assetHolderService.scrubPortfolioHoldings(portfolioId)

        await portfolioActivityRepository.scrubCollectionAsync(portfolioId)

        await this.portfolioDepositRepository.scrubAsync(portfolioId)

        await this.portfolioRepository.deleteAsync(portfolioId)
    }

    async recordPortfolioDeposit(deposit: TPortfolioDeposit) {
        const portfolioId = deposit.portfolioId

        await this.portfolioDepositRepository.storePortfolioDeposit(portfolioId, deposit)

        const deposits = await this.computePortfolioNetDeposits(portfolioId)

        this.updatePortfolio(portfolioId, { deposits: deposits })
    }

    async computePortfolioNetDeposits(portfolioId: string) {
        const deposits = await this.portfolioDepositRepository.getPortfolioDeposits(portfolioId)
        const total = deposits.reduce((acc: number, deposit: TPortfolioDeposit) => {
            return acc + deposit.units
        }, 0)
        return total
    }
}
