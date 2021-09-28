'use strict'

import { DateTime } from 'luxon'
import { ValidationError } from '../../errors'
import { serialize, serializeCollection } from './serializer'
import { exchangeOrderValidator as validate } from './validator'
import { TExchangeOrder, TNewExchangeOrderConfig } from '.'
import { OperationType, OrderSide, OrderType } from '../..'

export class ExchangeOrder {
    operation: OperationType // one of order, cancel
    orderType: OrderType
    orderSide: OrderSide
    assetId: string
    portfolioId: string
    orderPrice?: number
    orderSize: number
    orderId: string
    tags?: any
    events: any[]

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

    constructor(props: TExchangeOrder) {
        this.operation = props.operation
        this.orderType = props.orderType
        this.orderSide = props.orderSide
        this.assetId = props.assetId
        this.portfolioId = props.portfolioId
        this.orderPrice = props.orderPrice
        this.orderSize = props.orderSize
        this.tags = props.tags
        this.events = props.events

        this.createdAt = props.createdAt
        this.orderStatus = props.orderStatus
        this.orderState = props.orderState
        this.orderId = props.orderId
        this.sizeRemaining = props.sizeRemaining

        this.reason = props.reason

        this.filledPrice = props.filledPrice
        this.filledSize = props.filledSize
        this.filledValue = props.filledValue

        this.closedAt = props.closedAt
        this.executedAt = props.executedAt
    }

    // Member Properties for new model
    static newExchangeOrder(props: TNewExchangeOrderConfig) {
        const orderId = props.orderId
        const createdAt = DateTime.utc().toString()

        const exchangeOrderProps: TExchangeOrder = {
            orderId: orderId,
            createdAt: createdAt,
            orderStatus: 'received',
            orderState: 'open',
            sizeRemaining: props.orderSize,

            operation: props.operation || 'order',
            orderType: props.orderType,
            orderSide: props.orderSide,
            assetId: props.assetId,
            portfolioId: props.portfolioId,
            orderPrice: props.orderPrice,
            orderSize: props.orderSize,
            tags: props.tags,
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
