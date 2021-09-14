'use strict'

import { DateTime } from 'luxon'
import { generateId } from '../../util/idGenerator'
import { ValidationError } from '../../errors'
import { serialize, serializeCollection } from './serializer'
import { validate } from './validator'

export class Trade {
    createdAt: string
    tradeId?: string

    constructor(props: any) {
        if (props) Object.assign(this, props)
        this.createdAt = DateTime.utc().toString()

        // generate id. Trades start with TRADE: as a cue that it's a Trade
        if (!props.tradeId) {
            this.tradeId = `TRADE::${generateId()}`
        }
    }

    // Member Properties for new model
    static newTrade(props: any) {
        // TODO: pick out relevant props (like done in asset) before creating
        const newTradeProps = {
            ...props,
        }

        const newEntity = new Trade(newTradeProps)
        return newEntity
    }

    static serialize(selfUrl: string, baseUrl: string, data: any) {
        return serialize(selfUrl, baseUrl, data)
    }

    static serializeCollection(selfUrl: string, baseUrl: string, qs: any, data: any) {
        return serializeCollection(selfUrl, baseUrl, qs, data)
    }

    static validate(jsonPayload: any) {
        try {
            return validate(jsonPayload)
        } catch (error) {
            // ValdationError
            throw new ValidationError(error)
        }
    }
}
