'use strict'

import * as log4js from 'log4js'
import {
    LinearBondingCurveAMM,
    IMarketMaker,
    MarketMakerBase,
    TNewMarketMakerConfig,
    TOrder,
    TOrderConfig,
    ConstantBondingCurveAMM,
} from '.'
import {
    AssetRepository,
    ConflictError,
    DuplicateError,
    MarketMakerRepository,
    PortfolioRepository,
    PortfolioFactory,
    TNewPortfolioConfig,
    TransactionRepository,
} from '../..'
const logger = log4js.getLogger()

export class MarketMakerFactory {
    private marketMakerRepository: MarketMakerRepository
    private portfolioRepository: PortfolioRepository
    private transactionRepository: TransactionRepository
    private portfolioService: PortfolioFactory
    private assetRepository: AssetRepository

    constructor(
        assetRepository: AssetRepository,
        portfolioRepository: PortfolioRepository,
        transactionRepository: TransactionRepository,
        marketMakerRepository: MarketMakerRepository,
    ) {
        this.marketMakerRepository = marketMakerRepository
        this.portfolioRepository = portfolioRepository
        this.transactionRepository = transactionRepository
        this.portfolioService = new PortfolioFactory(portfolioRepository)
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
            case 'constantBondingCurveAMM':
                marketMaker = new ConstantBondingCurveAMM(
                    this.assetRepository,
                    this.portfolioRepository,
                    this.transactionRepository,
                    this.marketMakerRepository,
                    makerDef,
                )
                break

            default:
            case 'linearBondingCurveAMM':
                marketMaker = new LinearBondingCurveAMM(
                    this.assetRepository,
                    this.portfolioRepository,
                    this.transactionRepository,
                    this.marketMakerRepository,
                    makerDef,
                )
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

        const marketMaker = await this._createMarketMakerImpl(payload, shouldCreatePortfolio)

        logger.trace(`created marketMaker: ${marketMaker.assetId}`)

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

    private async _createMarketMakerImpl(config: TNewMarketMakerConfig, shouldCreatePortfolio: boolean) {
        let marketMaker: MarketMakerBase
        switch (config.type) {
            // case 'constantk':
            // default:
            //     marketMaker = KMaker.newMaker(config)
            //     break
            case 'constantBondingCurveAMM':
                marketMaker = ConstantBondingCurveAMM.newMaker(
                    this.assetRepository,
                    this.portfolioRepository,
                    this.transactionRepository,
                    this.marketMakerRepository,
                    config,
                )
                break

            default:
            case 'linearBondingCurveAMM':
                marketMaker = LinearBondingCurveAMM.newMaker(
                    this.assetRepository,
                    this.portfolioRepository,
                    this.transactionRepository,
                    this.marketMakerRepository,
                    config,
                )
                break
        }

        if (shouldCreatePortfolio) {
            const portfolioId = await this._createMarketMakerPortfolioImpl(marketMaker)
            marketMaker.portfolioId = portfolioId
        }

        await this.marketMakerRepository.storeAsync(marketMaker)
        return marketMaker
    }

    private async _createMarketMakerPortfolioImpl(marketMaker: MarketMakerBase) {
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
