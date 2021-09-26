'use strict'

import * as log4js from 'log4js'
import { OrderSide, TOrder, Trade } from '../..'
import {
    Asset,
    AssetRepository,
    MarketMakerRepository,
    NotFoundError,
    PortfolioRepository,
    TransactionRepository,
} from '../../..'
import { IMarketMaker } from './interfaces'
import { serialize, serializeCollection } from './serializer'
import { TMakerResult, TMarketMaker } from './types'

const logger = log4js.getLogger()

// MarketMaker holds value and shares to be sold.
export abstract class MarketMakerBase implements IMarketMaker {
    assetRepository: AssetRepository
    portfolioRepository: PortfolioRepository
    transactionRepository: TransactionRepository
    marketMakerRepository: MarketMakerRepository

    createdAt: string
    type: string
    ownerId: string
    assetId: string
    portfolioId?: string
    tags?: any
    params?: any
    quote?: any

    constructor(
        assetRepository: AssetRepository,
        portfolioRepository: PortfolioRepository,
        transactionRepository: TransactionRepository,
        marketMakerRepository: MarketMakerRepository,
        props: TMarketMaker,
    ) {
        this.createdAt = props.createdAt
        this.type = props.type
        this.assetId = props.assetId
        this.ownerId = props.ownerId
        this.portfolioId = props.portfolioId
        this.tags = props.tags
        this.params = props.params
        this.quote = props.quote

        this.assetRepository = assetRepository
        this.portfolioRepository = portfolioRepository
        this.transactionRepository = transactionRepository
        this.marketMakerRepository = marketMakerRepository
    }

    flattenMaker() {
        const makerData: TMarketMaker = {
            createdAt: this.createdAt,
            type: this.type,
            assetId: this.assetId,
            ownerId: this.ownerId,
            tags: this.tags,
            params: this.params,
            quote: this.quote,
        }
        if (this.portfolioId) {
            makerData.portfolioId = this.portfolioId
        }
        return makerData
    }

    async resolveAssetSpec(assetSpec: string | Asset) {
        const asset = typeof assetSpec === 'string' ? await this.assetRepository.getDetailAsync(assetSpec) : assetSpec
        if (!asset) {
            const msg = `Asset Not Found: ${assetSpec}`
            logger.error(msg)
            throw new Error(msg)
        }
        return asset
    }

    static serialize(selfUrl: string, baseUrl: string, data: any) {
        return serialize(selfUrl, baseUrl, data)
    }

    static serializeCollection(selfUrl: string, baseUrl: string, qs: any, data: any) {
        return serializeCollection(selfUrl, baseUrl, qs, data)
    }

    async processOrder(order: TOrder) {
        logger.trace(
            `marketMaker processOrder: ${order.orderId} for portfolio: ${order.portfolioId} asset: ${order.assetId}`,
        )
        const assetId = order.assetId
        const orderSide = order.orderSide
        const orderSize = order.orderSize

        ////////////////////////////
        // verify that asset exists
        ////////////////////////////
        const asset = await this.assetRepository.getDetailAsync(assetId)
        if (!asset) {
            const msg = `Invalid Order: Asset: ${assetId} does not exist`
            logger.error(msg)
            throw new NotFoundError(msg, { assetId })
        }

        // for this marketMaker, the asset portfolio holds the unit stock.
        const assetPortfolioId = asset.portfolioId
        if (!assetPortfolioId) {
            const msg = `Invalid Order: Asset Portfolio: not configured for ${assetId}`
            logger.error(msg)
            throw new NotFoundError(msg)
        }

        ////////////////////////////////////////////////////////
        // Process the order
        ////////////////////////////////////////////////////////
        const processMakerTrade = await this.processOrderImpl(orderSide, orderSize)
        if (processMakerTrade) {
            let { orderId, makerDeltaUnits, makerDeltaValue } = processMakerTrade

            const trade = new Trade(order)
            trade.supplyMakerSide({
                orderId: orderId,
                assetId: assetId,
                portfolioId: assetPortfolioId,
                orderSide: orderSide === 'bid' ? 'ask' : 'bid', // flip side from taker
                orderSize: orderSize,
                makerDeltaUnits: makerDeltaUnits,
                makerDeltaValue: makerDeltaValue,
            })
            logger.trace(
                `marketMaker trade: order: ${order.orderId} units: ${makerDeltaUnits} value: ${makerDeltaValue}`,
            )

            return trade
        } else {
            logger.trace(`marketMaker processOrder: NO TRADE for order: ${order.orderId}`)
            return null
        }
    }

    abstract processOrderImpl(orderSide: OrderSide, orderSize: number): Promise<TMakerResult | null>
}
