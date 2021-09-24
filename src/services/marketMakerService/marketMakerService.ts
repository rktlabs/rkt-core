'use strict'

import * as log4js from 'log4js'
const logger = log4js.getLogger()

import { IMarketMaker, BondingCurveAMM, TNewMarketMakerConfig, MarketMakerBase, TOrder, TOrderConfig } from '.'
import { PortfolioService } from '..'
import {
    MarketMakerRepository,
    PortfolioRepository,
    DuplicateError,
    ConflictError,
    TNewPortfolioConfig,
    AssetRepository,
} from '../..'

export class MarketMakerService {
    private marketMakerRepository: MarketMakerRepository
    private portfolioRepository: PortfolioRepository
    private portfolioService: PortfolioService
    private assetRepository: AssetRepository

    constructor(assetRepository: AssetRepository, portfolioRepository: PortfolioRepository) {
        this.marketMakerRepository = new MarketMakerRepository()
        this.portfolioRepository = portfolioRepository
        this.portfolioService = new PortfolioService(portfolioRepository)
        this.assetRepository = assetRepository
    }

    async getMarketMakerAsync(assetId: string): Promise<IMarketMaker | null> {
        const makerDef = await this.marketMakerRepository.getDetailAsync(assetId)
        if (makerDef == null) {
            return null
        }

        const makerType = makerDef.type

        let marketMaker: IMarketMaker | null = null
        switch (makerType) {
            // case 'constantk':
            //     marketMaker = new KMaker(makerDef)
            //     break

            // case 'bondingmaker2':
            //     marketMaker = new Bonding2Maker(makerDef)
            //     break

            // case 'logisticmaker1':
            //     marketMaker = new LogarithmicMaker(makerDef)
            //     break

            default:
            case 'bondingCurveAMM':
                marketMaker = new BondingCurveAMM(this.assetRepository, this.portfolioRepository, makerDef)
                break
        }
        return marketMaker
    }

    async createMarketMaker(payload: TNewMarketMakerConfig, shouldCreatePortfolio = true) {
        const assetId = payload.assetId

        if (assetId) {
            const marketMaker = await this.marketMakerRepository.getDetailAsync(assetId)
            if (marketMaker) {
                const msg = `MarketMaker Creation Failed - assetId: ${assetId} already exists`
                logger.error(msg)
                throw new DuplicateError(msg, { assetId })
            }

            // check for existence of marketMaker portfolio (shouldn't exist if marketMaker doesn't exist)
            if (shouldCreatePortfolio) {
                const portfolioId = `maker::${assetId}`
                const portfolio = await this.portfolioRepository.getDetailAsync(portfolioId)
                if (portfolio) {
                    const msg = `MarketMaker Creation Failed - portfolioId: ${portfolioId} already exists`
                    logger.error(msg)
                    throw new ConflictError(msg, { portfolioId })
                }
            }
        }

        const marketMaker = await this.createMarketMakerImpl(payload, shouldCreatePortfolio)

        logger.info(`created marketMaker: ${marketMaker.assetId}`)

        return marketMaker
    }

    async deleteMaker(assetId: string) {
        await this.scrubMarketMaker(assetId)
    }

    async scrubMarketMaker(assetId: string) {
        const portfolioId = `maker::${assetId}`
        await this.portfolioService.scrubPortfolio(portfolioId)
        await this.marketMakerRepository.deleteAsync(assetId)
    }

    static generateOrder(opts: TOrderConfig) {
        // eslint-disable-line
        const order: TOrder = {
            assetId: opts.assetId,
            orderId: opts.orderId,
            portfolioId: opts.portfolioId,
            orderSide: opts.orderSide,
            orderSize: Math.max(opts.orderSize, 0),
            tags: opts.tags,
            orderType: opts.orderType ? opts.orderType : 'market',
            sizeRemaining: opts.sizeRemaining === undefined ? opts.orderSize : opts.sizeRemaining,
            orderStatus: 'new',
            orderState: 'open',
        }
        return order
    }

    ////////////////////////////////////////////////////////
    // PRIVATE
    ////////////////////////////////////////////////////////

    private async createMarketMakerImpl(config: TNewMarketMakerConfig, shouldCreatePortfolio: boolean) {
        let marketMaker: MarketMakerBase
        switch (config.type) {
            // case 'bondingmaker2':
            //     marketMaker = Bonding2Maker.newMaker(config)
            //     break

            // case 'logisticmaker1':
            //     marketMaker = LogarithmicMaker.newMaker(config)
            //     break

            // case 'constantk':
            // default:
            //     marketMaker = KMaker.newMaker(config)
            //     break

            default:
            case 'bondingCurveAMM':
                marketMaker = BondingCurveAMM.newMaker(this.assetRepository, this.portfolioRepository, config)
                break
        }

        if (shouldCreatePortfolio) {
            const portfolioId = await this.createMarketMakerPortfolioImpl(marketMaker)
            marketMaker.portfolioId = portfolioId
        }

        await this.marketMakerRepository.storeAsync(marketMaker)
        return marketMaker
    }

    private async createMarketMakerPortfolioImpl(marketMaker: MarketMakerBase) {
        const makerPortfolioDef: TNewPortfolioConfig = {
            type: 'maker',
            portfolioId: `maker::${marketMaker.assetId}`,
            ownerId: marketMaker.ownerId,
            displayName: marketMaker.assetId,
        }

        const portfolio = await this.portfolioService.createPortfolio(makerPortfolioDef)
        return portfolio.portfolioId
    }
}
