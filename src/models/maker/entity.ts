import { serialize, serializeCollection } from './serializer'
import { TMaker, TNewMaker } from './types'
import { DateTime } from 'luxon'

// Maker holds value (coin) and shares to be sold.
export class Maker {
    createdAt: string
    type: string
    ownerId: string
    assetId: string
    portfolioId?: string

    madeUnits: number
    currentPrice?: number

    params?: any

    constructor(props: TMaker) {
        this.createdAt = props.createdAt
        this.type = props.type
        this.assetId = props.assetId
        this.ownerId = props.ownerId
        this.portfolioId = props.portfolioId
        this.madeUnits = props.madeUnits
        this.currentPrice = props.currentPrice

        this.params = props.params
    }

    // Member Properties for new model
    static newMaker(props: TNewMaker) {
        const createdAt = DateTime.utc().toString()
        const type = props.type
        const assetId = props.assetId

        const makerProps: TMaker = {
            createdAt,
            type,
            assetId,
            ownerId: props.ownerId,
            madeUnits: 0,
            currentPrice: props.settings?.initPrice,
            params: props.params,
        }

        const newEntity = new Maker(makerProps)

        return newEntity
    }

    static serialize(selfUrl: string, baseUrl: string, data: any) {
        return serialize(selfUrl, baseUrl, data)
    }

    static serializeCollection(selfUrl: string, baseUrl: string, qs: any, data: any) {
        return serializeCollection(selfUrl, baseUrl, qs, data)
    }
}
