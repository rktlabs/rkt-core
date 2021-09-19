'use strict'

import { PortfolioService } from '..'
import {
    // AssetRepository,
    MakerRepository,
    PortfolioRepository,
    DuplicateError,
    ConflictError,
    TNewPortfolioConfig,
} from '../..'
import { KMaker, Bonding1Maker, Bonding2Maker, LogarithmicMaker } from './makers'
import { MakerBase } from './makers/makerBase/entity'
import { IMaker } from './makers/makerBase/interfaces'
import { TNewMakerConfig } from './makers/makerBase/types'

export class MakerService {
    // private assetRepository: AssetRepository
    private makerRepository: MakerRepository
    private portfolioRepository: PortfolioRepository

    private portfolioService: PortfolioService

    constructor() {
        // this.assetRepository = new AssetRepository()
        this.makerRepository = new MakerRepository()
        this.portfolioRepository = new PortfolioRepository()

        this.portfolioService = new PortfolioService()
    }

    async getMakerAsync(assetId: string): Promise<IMaker | null> {
        const makerDef = await this.makerRepository.getDetailAsync(assetId)
        if (makerDef == null) {
            return null
        }

        const makerType = makerDef.type

        let maker: IMaker | null = null
        switch (makerType) {
            case 'constantk':
                maker = new KMaker(makerDef)
                break

            case 'bondingmaker1':
                maker = new Bonding1Maker(makerDef)
                break

            case 'bondingmaker2':
                maker = new Bonding2Maker(makerDef)
                break

            case 'logisticmaker1':
                maker = new LogarithmicMaker(makerDef)
                break

            default:
                maker = new KMaker(makerDef)
                break
        }
        return maker
    }

    async createMaker(payload: TNewMakerConfig, shouldCreatePortfolio = true) {
        const assetId = payload.assetId

        if (assetId) {
            const maker = await this.makerRepository.getDetailAsync(assetId)
            if (maker) {
                const msg = `Maker Creation Failed - assetId: ${assetId} already exists`
                throw new DuplicateError(msg, { assetId })
            }

            // check for existence of maker portfolio (shouldn't exist if maker doesn't exist)
            if (shouldCreatePortfolio) {
                const portfolioId = `maker::${assetId}`
                const portfolio = await this.portfolioRepository.getDetailAsync(portfolioId)
                if (portfolio) {
                    const msg = `Maker Creation Failed - portfolioId: ${portfolioId} already exists`
                    throw new ConflictError(msg, { portfolioId })
                }
            }
        }

        const maker = await this.createMakerImpl(payload, shouldCreatePortfolio)

        return maker
    }

    async deleteMaker(assetId: string) {
        await this.scrubMaker(assetId)
    }

    async scrubMaker(assetId: string) {
        const portfolioId = `maker::${assetId}`
        await this.portfolioService.scrubPortfolio(portfolioId)
        await this.makerRepository.deleteAsync(assetId)
    }

    ////////////////////////////////////////////////////////
    // PRIVATE
    ////////////////////////////////////////////////////////

    private async createMakerImpl(config: TNewMakerConfig, shouldCreatePortfolio: boolean) {
        let maker: MakerBase
        switch (config.type) {
            case 'bondingmaker1':
                maker = Bonding1Maker.newMaker(config)
                break

            case 'bondingmaker2':
                maker = Bonding2Maker.newMaker(config)
                break

            case 'logisticmaker1':
                maker = LogarithmicMaker.newMaker(config)
                break

            case 'constantk':
            default:
                maker = KMaker.newMaker(config)
                break
        }

        if (shouldCreatePortfolio) {
            const portfolioId = await this.createMakerPortfolioImpl(maker)
            maker.portfolioId = portfolioId
        }

        await this.makerRepository.storeAsync(maker)
        return maker
    }

    private async createMakerPortfolioImpl(maker: MakerBase) {
        const makerPortfolioDef: TNewPortfolioConfig = {
            type: 'maker',
            portfolioId: `maker::${maker.assetId}`,
            ownerId: maker.ownerId,
            displayName: maker.assetId,
        }

        const portfolio = await this.portfolioService.createPortfolio(makerPortfolioDef)
        return portfolio.portfolioId
    }
}
