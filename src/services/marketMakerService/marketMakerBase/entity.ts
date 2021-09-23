'use strict'

import { TOrder, Trade } from '../..'
import {
    Asset,
    AssetRepository,
    MarketMakerRepository,
    NotFoundError,
    PortfolioRepository,
    TAssetUpdate,
} from '../../..'
import { IMarketMaker } from './interfaces'
import { serialize, serializeCollection } from './serializer'
import { TMarketMaker, TMakerResult } from './types'

// MarketMaker holds value and shares to be sold.
export abstract class MarketMakerBase implements IMarketMaker {
    assetRepository: AssetRepository
    marketMakerRepository: MarketMakerRepository
    portfolioRepository: PortfolioRepository

    createdAt: string
    type: string
    ownerId: string
    assetId: string
    portfolioId?: string
    tags?: any
    params?: any

    // currentPrice?: number

    constructor(props: TMarketMaker) {
        this.createdAt = props.createdAt
        this.type = props.type
        this.assetId = props.assetId
        this.ownerId = props.ownerId
        this.portfolioId = props.portfolioId
        this.tags = props.tags
        this.params = props.params

        // this.currentPrice = props.currentPrice

        this.assetRepository = new AssetRepository()
        this.marketMakerRepository = new MarketMakerRepository()
        this.portfolioRepository = new PortfolioRepository()
    }

    flattenMaker() {
        const makerData: TMarketMaker = {
            createdAt: this.createdAt,
            type: this.type,
            assetId: this.assetId,
            ownerId: this.ownerId,
            tags: this.tags,
            params: this.params,

            // currentPrice: this.currentPrice,
        }
        if (this.portfolioId) {
            makerData.portfolioId = this.portfolioId
        }
        return makerData
    }

    async resolveAssetSpec(assetSpec: string | Asset) {
        const asset = typeof assetSpec === 'string' ? await this.assetRepository.getDetailAsync(assetSpec) : assetSpec
        if (!asset) {
            throw new Error(`Asset Not Found: ${assetSpec}`)
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
        const assetId = order.assetId
        const orderSide = order.orderSide
        const orderSize = order.orderSize

        ////////////////////////////
        // verify that asset exists
        ////////////////////////////
        const asset = await this.assetRepository.getDetailAsync(assetId)
        if (!asset) {
            const msg = `Invalid Order: Asset: ${assetId} does not exist`
            throw new NotFoundError(msg, { assetId })
        }

        // for this maker, the asset portfolio holds the unit stock.
        const assetPortfolioId = asset.portfolioId
        if (!assetPortfolioId) {
            const msg = `Invalid Order: Asset Portfolio: not configured for ${assetId}`
            throw new NotFoundError(msg)
        }

        ////////////////////////////////////////////////////////
        // Process the order
        ////////////////////////////////////////////////////////
        const processMakerTrade = await this.processOrderImpl(orderSide, orderSize)
        if (processMakerTrade) {
            let { makerDeltaUnits, makerDeltaValue } = processMakerTrade

            const trade = new Trade(order)
            trade.supplyMakerSide({
                assetId: assetId,
                portfolioId: assetPortfolioId,
                orderSide: orderSide === 'bid' ? 'ask' : 'bid', // flip side from taker
                orderSize: orderSize,
                makerDeltaUnits: makerDeltaUnits,
                makerDeltaValue: makerDeltaValue,
            })

            return trade
        } else {
            return null
        }
    }

    abstract processOrderImpl(orderSide: string, orderSize: number): Promise<TMakerResult | null>

    ////////////////////////////////////////////////////
    //  onUpdateQuote
    //  - store new quoted for the asset indicated
    ////////////////////////////////////////////////////
    onUpdateQuote = async (trade: Trade, bid: number, ask: number) => {
        const assetId = trade.assetId
        const last = trade.taker.filledPrice

        const updateProps: TAssetUpdate = { bid, ask, last }
        await this.assetRepository.updateAsync(assetId, updateProps)
    }
}
