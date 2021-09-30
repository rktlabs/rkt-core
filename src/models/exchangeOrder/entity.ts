'use strict'

import { DateTime } from 'luxon'
import { ValidationError } from '../../errors'
import { serialize, serializeCollection } from './serializer'
import { exchangeOrderValidator as validate } from './validator'
import { TExchangeOrder, TOrderSource } from '.'
import { generateId } from '../..'

export class ExchangeOrder {
    // operation: OperationType // one of order, cancel
    portfolioId: string
    orderId: string

    orderSource: TOrderSource

    createdAt: string
    orderStatus: string
    orderState: string
    sizeRemaining?: number
    closedAt?: string
    executedAt?: string
    reason?: string
    filledPrice?: number
    filledSize?: number
    filledValue?: number
    events: any[]

    constructor(props: TExchangeOrder) {
        // this.operation = props.operation
        this.orderId = props.orderId
        this.portfolioId = props.orderSource.portfolioId

        this.orderSource = props.orderSource

        this.createdAt = props.createdAt
        this.orderStatus = props.orderStatus
        this.orderState = props.orderState
        this.sizeRemaining = props.sizeRemaining

        this.reason = props.reason

        this.filledPrice = props.filledPrice
        this.filledSize = props.filledSize
        this.filledValue = props.filledValue

        this.closedAt = props.closedAt
        this.events = props.events
        this.executedAt = props.executedAt
    }

    // Member Properties for new model
    static newExchangeOrder(orderSource: TOrderSource) {
        const orderId = orderSource.sourceOrderId
        const createdAt = DateTime.utc().toString()

        const exchangeOrderProps: TExchangeOrder = {
            orderId: orderId || `ORDER::${generateId()}`,
            createdAt: createdAt,
            orderStatus: 'received',
            orderState: 'open',
            sizeRemaining: orderSource.orderSize,

            orderSource: orderSource,

            // operation: props.operation || 'order',
            portfolioId: orderSource.portfolioId,
            events: [],
        }

        const newEntity = new ExchangeOrder(exchangeOrderProps)
        return newEntity
    }

    static validate(jsonPayload: any) {
        try {
            return validate(jsonPayload)
        } catch (error) {
            // ValdationError
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
