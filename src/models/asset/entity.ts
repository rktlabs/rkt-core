import { DateTime } from 'luxon'
import { TAsset, TNewAsset } from '.'
import { ValidationError, TypeError, NameError } from '../../errors'
import { serialize, serializeCollection } from './serializer'
import { validate } from './validator'

// Asset holds value (coin) and shares to be sold.
export class Asset {
    createdAt: string
    type: string
    symbol: string
    assetId: string
    displayName: string
    ownerId: string
    // portfolioId?: string

    leagueId: string
    leagueDisplayName: string

    tags?: any
    xids?: any

    // initialPrice?: number
    bid?: number
    ask?: number
    last?: number

    constructor(props: TAsset) {
        this.createdAt = props.createdAt
        this.type = props.type
        this.symbol = props.symbol
        this.assetId = props.assetId
        this.displayName = props.displayName
        this.ownerId = props.ownerId
        // this.portfolioId = props.portfolioId

        this.leagueId = props.leagueId
        this.leagueDisplayName = props.leagueDisplayName

        this.xids = props.xids
        this.tags = props.tags

        // this.initialPrice = props.initialPrice
        this.bid = props.bid
        this.ask = props.ask
        this.last = props.last
    }

    toString() {
        return `[asset: ${this.assetId}]`
    }

    static newAsset(props: TNewAsset) {
        const symbolParts = props.symbol.split(':')
        if (symbolParts.length < 2 || symbolParts[1] !== '') {
            throw new Error('New Asset: Invalid symbol')
        }

        const type = symbolParts[0]
        const assetId = props.symbol
        const createdAt = DateTime.utc().toString()
        const displayName = props.displayName || assetId

        const assetProps: TAsset = {
            assetId,
            createdAt,
            displayName,
            ownerId: props.ownerId,
            type: type,
            symbol: props.symbol,
            leagueId: props.leagueId,
            leagueDisplayName: props.leagueDisplayName || props.leagueId,
        }

        if (props.tags) {
            assetProps.tags = Object.assign({}, props.tags)
        }

        if (props.xids) {
            assetProps.xids = Object.assign({}, props.xids)
        }

        // if (props.initialPrice) {
        //     assetProps.initialPrice = props.initialPrice
        //     assetProps.bid = props.initialPrice
        //     assetProps.ask = props.initialPrice
        //     assetProps.last = props.initialPrice
        // }

        const newEntity = new Asset(assetProps)
        return newEntity
    }

    static validate(jsonPayload: any) {
        if (jsonPayload.assetId && jsonPayload.type) {
            const parts = jsonPayload.assetId.split(':')
            if (parts[0] !== jsonPayload.type) {
                throw new TypeError('Invalid Asset Id (type)')
            } else if (parts.length < 3 || parts[1] !== '') {
                throw new NameError('Invalid Asset Id')
            }
        }

        try {
            return validate(jsonPayload)
        } catch (error) {
            throw new ValidationError(error)
        }
    }

    static serialize(selfUrl: string, baseUrl: string, data: any) {
        return serialize(selfUrl, baseUrl, data)
    }

    static serializeCollection(selfUrl: string, baseUrl: string, qs: any, data: any) {
        return serializeCollection(selfUrl, baseUrl, qs, data)
    }
}
