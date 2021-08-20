import { DateTime } from 'luxon'
import { ValidationError, TypeError, NameError } from '../../errors'
import { serialize, serializeCollection } from './earnerSerializer'
import { validate } from './earnerValidator'

export type TNewEarner = {
    ownerId: string
    symbol: string
    displayName?: string
    scale?: number

    subject?: any
    tags?: any
    xids?: any
}

export type TEarner = {
    createdAt: string
    ownerId: string
    type: string
    earnerId: string
    displayName: string
    scale: number
    symbol: string

    subject?: any
    tags?: any
    xids?: any
    cumulativeEarnings: number
}

export type TEarnerUpdate = {
    cumulativeEarnings?: number
}

// Earner holds value (coin) and shares to be sold.
export class Earner {
    createdAt: string
    ownerId: string
    type: string
    earnerId: string
    displayName: string
    symbol: string
    scale: number

    subject?: any
    tags?: any
    xids?: any
    cumulativeEarnings: number

    constructor(props: TEarner) {
        this.createdAt = props.createdAt
        this.type = props.type
        this.earnerId = props.earnerId
        this.ownerId = props.ownerId
        this.displayName = props.displayName
        this.symbol = props.symbol
        this.symbol = props.symbol

        this.xids = props.xids
        this.tags = props.tags
        this.scale = props.scale
        this.cumulativeEarnings = props.cumulativeEarnings
    }

    // Member Properties for new model
    static newEarner(props: TNewEarner) {
        const symbolParts = props.symbol.split(':')
        if (symbolParts.length < 2 || symbolParts[1] !== '') {
            throw new Error('New Earner: Invalid symbol')
        }

        const type = symbolParts[0]
        const earnerId = props.symbol
        const createdAt = DateTime.utc().toString()
        const displayName = props.displayName || earnerId

        const earnerProps: TEarner = {
            earnerId,
            createdAt,
            displayName,
            symbol: props.symbol,
            ownerId: props.ownerId,
            type: type,
            scale: props.scale || 1,
            cumulativeEarnings: 0,
        }

        if (props.subject) {
            earnerProps.subject = props.subject
        }

        if (props.tags) {
            earnerProps.tags = Object.assign({}, props.tags)
        }

        if (props.xids) {
            earnerProps.xids = Object.assign({}, props.xids)
        }

        const newEntity = new Earner(earnerProps)
        return newEntity
    }

    static validate(jsonPayload: any) {
        if (jsonPayload.earnerId && jsonPayload.type) {
            const parts = jsonPayload.earnerId.split(':')
            if (parts[0] !== jsonPayload.type) {
                throw new TypeError('Invalid Earner Id (type)')
            } else if (parts.length < 3 || parts[1] !== '') {
                throw new NameError('Invalid Earner Id')
            }
        }

        try {
            return validate(jsonPayload)
        } catch (error) {
            // ValdationError
            throw new ValidationError(error)
        }
    }

    static serialize(req: any, data: any) {
        return serialize(req, data)
    }

    static serializeCollection(req: any, data: any) {
        return serializeCollection(req, data)
    }
}
