import { TakerOrder, MakerTrade } from '../../..'
import { AssetRepository, MakerRepository, TAssetUpdate } from '../../../..'
import { IMaker } from './interfaces'
import { serialize, serializeCollection } from './serializer'
import { TMaker } from './types'

// Maker holds value (coin) and shares to be sold.
export abstract class MakerBase implements IMaker {
    assetRepository: AssetRepository
    makerRepository: MakerRepository

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

    abstract processTakerOrder(order: TakerOrder): Promise<MakerTrade | null>

    abstract processSimpleOrder(
        assetId: string,
        orderSide: string,
        orderSize: number,
    ): Promise<{ makerDeltaUnits: number; makerDeltaCoins: number } | null>

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
