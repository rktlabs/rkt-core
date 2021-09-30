'use strict'

import * as log4js from 'log4js'
import { ConstantBondingCurveAMM, LinearBondingCurveAMM } from '../services/marketMakerService'
import {
    MarketMakerRepository,
    PortfolioRepository,
    TransactionRepository,
    PortfolioFactory,
    AssetRepository,
    ExchangeQuoteRepository,
    DuplicateError,
    ConflictError,
    TOrderSource,
    TNewPortfolioConfig,
    TNewMarketMakerConfig,
} from '..'
import { IMarketMakerService, MarketMakerServiceBase } from '../services/marketMakerService/marketMakerServiceBase'

const logger = log4js.getLogger('MarketMakerFactory')

export class MarketMakerFactory {
    private marketMakerRepository: MarketMakerRepository
    private portfolioRepository: PortfolioRepository
    private transactionRepository: TransactionRepository
    private portfolioFactory: PortfolioFactory
    private assetRepository: AssetRepository
    private exchangeQuoteRepository: ExchangeQuoteRepository

    constructor(
        assetRepository: AssetRepository,
        portfolioRepository: PortfolioRepository,
        transactionRepository: TransactionRepository,
        marketMakerRepository: MarketMakerRepository,
    ) {
        this.marketMakerRepository = marketMakerRepository
        this.portfolioRepository = portfolioRepository
        this.transactionRepository = transactionRepository
        this.portfolioFactory = new PortfolioFactory(portfolioRepository)
        this.assetRepository = assetRepository
        this.exchangeQuoteRepository = new ExchangeQuoteRepository()
    }

    async getMarketMakerAsync(assetId: string): Promise<IMarketMakerService | null> {
        const makerDef = await this.marketMakerRepository.getDetailAsync(assetId)
        if (makerDef == null) {
            return null
        }

        const makerType = makerDef.type

        let marketMakerService: IMarketMakerService | null = null
        switch (makerType) {
            // case 'constantk':
            //     marketMaker = new KMaker(makerDef)
            //     break
            case 'constantBondingCurveAMM':
                marketMakerService = new ConstantBondingCurveAMM(
                    this.assetRepository,
                    this.portfolioRepository,
                    this.transactionRepository,
                    this.marketMakerRepository,
                    makerDef,
                )
                break

            default:
            case 'linearBondingCurveAMM':
                marketMakerService = new LinearBondingCurveAMM(
                    this.assetRepository,
                    this.portfolioRepository,
                    this.transactionRepository,
                    this.marketMakerRepository,
                    makerDef,
                )
                break
        }
        return marketMakerService
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

        logger.trace(`created marketMaker: ${marketMaker.marketMaker.assetId}`)

        return marketMaker
    }

    async deleteMaker(assetId: string) {
        await this.marketMakerRepository.deleteAsync(assetId)
    }

    ////////////////////////////////////////////////////////
    // PRIVATE
    ////////////////////////////////////////////////////////

    private async _createMarketMakerImpl(config: TNewMarketMakerConfig, shouldCreatePortfolio: boolean) {
        let marketMaker: MarketMakerServiceBase
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
            marketMaker.marketMaker.portfolioId = portfolioId
        }

        await this.marketMakerRepository.storeAsync(marketMaker.marketMaker)

        if (marketMaker.marketMaker.quote) {
            await this.exchangeQuoteRepository.storeAsync(
                marketMaker.marketMaker.quote?.assetId,
                marketMaker.marketMaker.quote,
            )
        }

        return marketMaker
    }

    private async _createMarketMakerPortfolioImpl(marketMaker: MarketMakerServiceBase) {
        const makerPortfolioDef: TNewPortfolioConfig = {
            type: 'maker',
            portfolioId: `maker::${marketMaker.marketMaker.assetId}`,
            ownerId: marketMaker.marketMaker.ownerId,
            displayName: marketMaker.marketMaker.assetId,
        }

        const portfolio = await this.portfolioFactory.createPortfolio(makerPortfolioDef)
        return portfolio.portfolioId
    }
}
