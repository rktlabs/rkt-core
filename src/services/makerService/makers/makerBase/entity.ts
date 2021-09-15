import { MarketOrder, Trade } from '../../..'
import { AssetRepository, MakerRepository, TAssetUpdate } from '../../../..'
import { IMaker } from './interfaces'
import { serialize, serializeCollection } from './serializer'
import { TMaker, TNewMakerConfig, TTakeResult } from './types'

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

    toTMaker() {
        const tMaker: TMaker = {
            createdAt: this.createdAt,
            type: this.type,
            assetId: this.assetId,
            ownerId: this.ownerId,
            portfolioId: this.portfolioId,
            currentPrice: this.currentPrice,
            params: this.params,
        }
        return tMaker
    }

    static serialize(selfUrl: string, baseUrl: string, data: any) {
        return serialize(selfUrl, baseUrl, data)
    }

    static serializeCollection(selfUrl: string, baseUrl: string, qs: any, data: any) {
        return serializeCollection(selfUrl, baseUrl, qs, data)
    }

    abstract computeMakerStateUpdate(stateUpdate: any): any

    abstract processOrderUnits(takeSize: number): TTakeResult | null

    abstract computeMakerInitialState(newMakerConfig: TNewMakerConfig): any

    abstract processOrder(maker: IMaker, order: MarketOrder): Promise<Trade | null>

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
