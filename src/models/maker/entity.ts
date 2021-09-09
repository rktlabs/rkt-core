import { DateTime } from 'luxon'
import { TMaker, TNewMaker } from '.'
import { ValidationError, TypeError, NameError } from '../../errors'
import { serialize, serializeCollection } from './serializer'
import { validate } from './validator'

// Maker holds value (coin) and shares to be sold.
export class Maker {
    createdAt: string
    type: string
    symbol: string
    makerId: string
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

    constructor(props: TMaker) {
        this.createdAt = props.createdAt
        this.type = props.type
        this.symbol = props.symbol
        this.makerId = props.makerId
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
        return `[maker: ${this.makerId}]`
    }

    static newMaker(props: TNewMaker) {
        const symbolParts = props.symbol.split(':')
        if (symbolParts.length < 2 || symbolParts[1] !== '') {
            throw new Error('New Maker: Invalid symbol')
        }

        const type = symbolParts[0]
        const makerId = props.symbol
        const createdAt = DateTime.utc().toString()
        const displayName = props.displayName || makerId

        const makerProps: TMaker = {
            makerId,
            createdAt,
            displayName,
            ownerId: props.ownerId,
            type: type,
            symbol: props.symbol,
            leagueId: props.leagueId,
            leagueDisplayName: props.leagueDisplayName || props.leagueId,
        }

        if (props.tags) {
            makerProps.tags = Object.assign({}, props.tags)
        }

        if (props.xids) {
            makerProps.xids = Object.assign({}, props.xids)
        }

        // if (props.initialPrice) {
        //     makerProps.initialPrice = props.initialPrice
        //     makerProps.bid = props.initialPrice
        //     makerProps.ask = props.initialPrice
        //     makerProps.last = props.initialPrice
        // }

        const newEntity = new Maker(makerProps)
        return newEntity
    }

    static validate(jsonPayload: any) {
        if (jsonPayload.makerId && jsonPayload.type) {
            const parts = jsonPayload.makerId.split(':')
            if (parts[0] !== jsonPayload.type) {
                throw new TypeError('Invalid Maker Id (type)')
            } else if (parts.length < 3 || parts[1] !== '') {
                throw new NameError('Invalid Maker Id')
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
