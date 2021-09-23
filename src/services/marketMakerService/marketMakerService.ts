'use strict'

import {
    IMarketMaker,
    BondingCurveAMM,
    // KMaker,
    // Bonding2Maker,
    // LogarithmicMaker,
    TNewMarketMakerConfig,
    MarketMakerBase,
    TOrder,
    TOrderConfig,
} from '.'
import { PortfolioService } from '..'
import { MarketMakerRepository, PortfolioRepository, DuplicateError, ConflictError, TNewPortfolioConfig } from '../..'

export class MarketMakerService {
    private marketMakerRepository: MarketMakerRepository
    private portfolioRepository: PortfolioRepository
    private portfolioService: PortfolioService

    constructor() {
        this.marketMakerRepository = new MarketMakerRepository()
        this.portfolioRepository = new PortfolioRepository()
        this.portfolioService = new PortfolioService()
    }

    async getMakerAsync(assetId: string): Promise<IMarketMaker | null> {
        const makerDef = await this.marketMakerRepository.getDetailAsync(assetId)
        if (makerDef == null) {
            return null
        }

        const makerType = makerDef.type

        let maker: IMarketMaker | null = null
        switch (makerType) {
            // case 'constantk':
            //     maker = new KMaker(makerDef)
            //     break

            // case 'bondingmaker2':
            //     maker = new Bonding2Maker(makerDef)
            //     break

            // case 'logisticmaker1':
            //     maker = new LogarithmicMaker(makerDef)
            //     break

            default:
            case 'bondingCurveAMM':
                maker = new BondingCurveAMM(makerDef)
                break
        }
        return maker
    }

    async createMarketMaker(payload: TNewMarketMakerConfig, shouldCreatePortfolio = true) {
        const assetId = payload.assetId

        if (assetId) {
            const maker = await this.marketMakerRepository.getDetailAsync(assetId)
            if (maker) {
                const msg = `MarketMaker Creation Failed - assetId: ${assetId} already exists`
                throw new DuplicateError(msg, { assetId })
            }

            // check for existence of maker portfolio (shouldn't exist if maker doesn't exist)
            if (shouldCreatePortfolio) {
                const portfolioId = `maker::${assetId}`
                const portfolio = await this.portfolioRepository.getDetailAsync(portfolioId)
                if (portfolio) {
                    const msg = `MarketMaker Creation Failed - portfolioId: ${portfolioId} already exists`
                    throw new ConflictError(msg, { portfolioId })
                }
            }
        }

        const maker = await this.createMarketMakerImpl(payload, shouldCreatePortfolio)

        return maker
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
        let maker: MarketMakerBase
        switch (config.type) {
            // case 'bondingmaker2':
            //     maker = Bonding2Maker.newMaker(config)
            //     break

            // case 'logisticmaker1':
            //     maker = LogarithmicMaker.newMaker(config)
            //     break

            // case 'constantk':
            // default:
            //     maker = KMaker.newMaker(config)
            //     break

            default:
            case 'bondingCurveAMM':
                maker = BondingCurveAMM.newMaker(config)
                break
        }

        if (shouldCreatePortfolio) {
            const portfolioId = await this.createMarketMakerPortfolioImpl(maker)
            maker.portfolioId = portfolioId
        }

        await this.marketMakerRepository.storeAsync(maker)
        return maker
    }

    private async createMarketMakerPortfolioImpl(maker: MarketMakerBase) {
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
