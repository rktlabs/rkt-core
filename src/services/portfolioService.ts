'use strict'

import { PortfolioHoldingsService } from '.'
import {
    PortfolioRepository,
    AssetRepository,
    MakerRepository,
    LeagueRepository,
    PortfolioActivityRepository,
    PortfolioDepositRepository,
    TNewPortfolio,
    DuplicateError,
    Portfolio,
    TPortfolioUpdate,
    ConflictError,
    TPortfolioDeposit,
} from '..'

export class PortfolioService {
    private portfolioRepository: PortfolioRepository
    private assetRepository: AssetRepository
    private makerRepository: MakerRepository
    private leagueRepository: LeagueRepository
    private portfolioActivityRepository: PortfolioActivityRepository
    private portfolioDepositRepository: PortfolioDepositRepository
    private portfolioHoldingsService: PortfolioHoldingsService

    constructor() {
        this.portfolioRepository = new PortfolioRepository()
        this.portfolioActivityRepository = new PortfolioActivityRepository()
        this.assetRepository = new AssetRepository()
        this.makerRepository = new MakerRepository()
        this.leagueRepository = new LeagueRepository()
        this.portfolioDepositRepository = new PortfolioDepositRepository()
        this.portfolioHoldingsService = new PortfolioHoldingsService()
    }

    // create new portfolio. Fail if it already exists.
    async newPortfolio(payload: TNewPortfolio) {
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

    // ensure that portfolio is created. crate new portfolio and new cache if don't exist
    // leave in place anything already there.
    async createPortfolio(payload: TNewPortfolio) {
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
        // check for linked assets
        let assetIds = await this.assetRepository.isPortfolioUsed(portfolioId)
        if (assetIds) {
            throw new ConflictError(`Cannot Delete Portfolio. Asset Portfolio in use: ${assetIds}`)
        }

        let makerIds = await this.makerRepository.isPortfolioUsed(portfolioId)
        if (makerIds) {
            throw new ConflictError(`Cannot Delete Portfolio. Maker Portfolio in use: ${makerIds}`)
        }

        let leagueIds = await this.leagueRepository.isPortfolioUsed(portfolioId)
        if (leagueIds) {
            throw new ConflictError(`Cannot Delete Portfolio. Portfolio linked to league: ${leagueIds}`)
        }

        await this.portfolioHoldingsService.scrubPortfolioHoldings(portfolioId)

        await this.portfolioActivityRepository.scrubCollectionAsync(portfolioId)

        await this.portfolioDepositRepository.scrubPortfolioDeposits(portfolioId)

        await this.portfolioRepository.deleteAsync(portfolioId)
    }

    async scrubPortfolio(portfolioId: string) {
        await this.portfolioHoldingsService.scrubPortfolioHoldings(portfolioId)

        await this.portfolioActivityRepository.scrubCollectionAsync(portfolioId)

        await this.portfolioDepositRepository.scrubPortfolioDeposits(portfolioId)

        await this.portfolioRepository.deleteAsync(portfolioId)
    }

    async submitPortfolioDeposit(deposit: TPortfolioDeposit) {
        const portfolioId = deposit.portfolioId

        await this.portfolioDepositRepository.storePortfolioDeposit(portfolioId, deposit)

        const deposits = await this.computePortfolioNetDeposits(portfolioId)

        this.updatePortfolio(portfolioId, { deposits: deposits })
    }

    async computePortfolioNetDeposits(portfolioId: string) {
        const deposits = await this.portfolioDepositRepository.listPortfolioDeposits(portfolioId)
        const total = deposits.reduce((acc: number, deposit: TPortfolioDeposit) => {
            return acc + deposit.units
        }, 0)
        return total
    }
}
