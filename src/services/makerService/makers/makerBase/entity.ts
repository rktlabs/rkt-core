import { TakerOrder, MakerTrade, MakerFill } from '../../..'
import {
    Asset,
    AssetRepository,
    MakerRepository,
    NotFoundError,
    PortfolioRepository,
    round4,
    TAssetUpdate,
} from '../../../..'
import { IMaker } from './interfaces'
import { serialize, serializeCollection } from './serializer'
import { TMaker } from './types'

// Maker holds value and shares to be sold.
export abstract class MakerBase implements IMaker {
    assetRepository: AssetRepository
    makerRepository: MakerRepository
    portfolioRepository: PortfolioRepository

    createdAt: string
    type: string
    ownerId: string
    assetId: string
    portfolioId?: string
    currentPrice?: number
    params?: any

    constructor(props: TMaker) {
        this.createdAt = props.createdAt
        this.type = props.type
        this.assetId = props.assetId
        this.ownerId = props.ownerId
        this.portfolioId = props.portfolioId
        this.currentPrice = props.currentPrice
        this.params = props.params

        this.assetRepository = new AssetRepository()
        this.makerRepository = new MakerRepository()
        this.portfolioRepository = new PortfolioRepository()
    }

    flattenMaker() {
        const tMaker: TMaker = {
            createdAt: this.createdAt,
            type: this.type,
            assetId: this.assetId,
            ownerId: this.ownerId,
            currentPrice: this.currentPrice,
            params: this.params,
        }
        if (this.portfolioId) {
            tMaker.portfolioId = this.portfolioId
        }
        return tMaker
    }

    static serialize(selfUrl: string, baseUrl: string, data: any) {
        return serialize(selfUrl, baseUrl, data)
    }

    static serializeCollection(selfUrl: string, baseUrl: string, qs: any, data: any) {
        return serializeCollection(selfUrl, baseUrl, qs, data)
    }

    abstract processOrderImpl(
        orderSide: string,
        orderSize: number,
    ): Promise<{ makerDeltaUnits: number; makerDeltaCoins: number } | null>

    async resolveAssetSpec(assetSpec: string | Asset) {
        const asset = typeof assetSpec === 'string' ? await this.assetRepository.getDetailAsync(assetSpec) : assetSpec
        if (!asset) {
            throw new Error(`Asset Not Found: ${assetSpec}`)
        }
        return asset
    }

    async processTakerOrder(order: TakerOrder) {
        const assetId = order.assetId
        const orderSide = order.orderSide
        const orderSize = order.orderSize
        const trade = new MakerTrade(order)

        ////////////////////////////
        // verify that asset exists
        ////////////////////////////
        const asset = await this.assetRepository.getDetailAsync(assetId)
        if (!asset) {
            const msg = `Invalid Order: Asset: ${assetId} does not exist`
            throw new NotFoundError(msg, { assetId })
        }

        ////////////////////////////////////////////////////////
        // Process the order
        ////////////////////////////////////////////////////////
        // TODO: There is an assumption that the maker portfolio is the asset. That would,
        // actually, be up to the maker, yes?
        const assetPortfolioId = asset.portfolioId
        if (!assetPortfolioId) {
            const msg = `Invalid Order: Asset Portfolio: not configured`
            throw new NotFoundError(msg)
        }

        const tradeStats = await this.processOrderImpl(orderSide, orderSize)
        if (tradeStats) {
            let { makerDeltaUnits, makerDeltaCoins } = tradeStats
            const makerFill = new MakerFill({
                assetId: assetId,
                portfolioId: assetPortfolioId,
                orderSide: orderSide === 'bid' ? 'ask' : 'bid', // flip side from taker
                orderSize: orderSize,
            })

            trade.fillMaker(makerFill, makerDeltaUnits, makerDeltaCoins)

            return trade
        } else {
            return null
        }
    }

    ////////////////////////////////////////////////////
    //  onUpdateQuote
    //  - store new quoted for the asset indicated
    ////////////////////////////////////////////////////
    onUpdateQuote = async (trade: MakerTrade, bid: number, ask: number) => {
        const assetId = trade.assetId
        const last = trade.taker.filledPrice

        const updateProps: TAssetUpdate = { bid, ask, last }
        await this.assetRepository.updateAsync(assetId, updateProps)
    }
}
