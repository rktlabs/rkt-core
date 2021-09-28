'use strict'

import { DateTime } from 'luxon'
import { generateId } from '../../util/idGenerator'
import { ValidationError } from '../../errors'
import { serialize, serializeCollection } from './serializer'
import { validate } from './validator'
import { TPortfolioOrder, TNewPortfolioOrderProps } from '.'
import { OrderSide, OrderType } from '../..'

export class PortfolioOrder {
    createdAt: string
    orderId: string
    assetId: string
    orderSide: OrderSide
    orderSize: number
    orderStatus: string
    orderState: string
    orderType: OrderType
    reason?: string

    orderPrice?: number
    events: any[]
    tags?: any
    xids?: any

    closedAt?: string
    executedAt?: string
    filledPrice?: number
    filledSize?: number
    filledValue?: number
    sizeRemaining?: number

    constructor(props: TPortfolioOrder) {
        this.createdAt = props.createdAt
        this.orderId = props.orderId
        this.assetId = props.assetId
        this.closedAt = props.closedAt
        this.executedAt = props.executedAt
        this.filledPrice = props.filledPrice
        this.filledSize = props.filledSize
        this.filledValue = props.filledValue
        this.sizeRemaining = props.sizeRemaining
        this.orderSide = props.orderSide
        this.orderSize = props.orderSize
        this.orderStatus = props.orderStatus
        this.orderState = props.orderState
        this.orderType = props.orderType
        this.orderPrice = props.orderPrice
        this.events = props.events
        this.tags = props.tags
        this.reason = props.reason
    }

    static newOrder(props: TNewPortfolioOrderProps) {
        const orderId = `ORDER::${generateId()}`
        const createdAt = DateTime.utc().toString()

        const newOrderProps: TPortfolioOrder = {
            orderId: orderId,
            createdAt: createdAt,
            orderType: props.orderType || 'market',
            assetId: props.assetId, // required
            orderSide: props.orderSide, // required
            orderSize: props.orderSize, // required
            orderStatus: 'received', // received | filled | failed
            orderState: 'open', // open | closed
            events: [],
        }

        // limit order requires orderPrice
        if (props.orderPrice) {
            newOrderProps.orderPrice = props.orderPrice
        }

        if (props.tags) {
            newOrderProps.tags = props.tags
        }

        const newEntity = new PortfolioOrder(newOrderProps)

        return newEntity
    }

    static validate(jsonPayload: any) {
        try {
            return validate(jsonPayload)
        } catch (error) {
            throw new ValidationError(error)
        }
    }

    static serialize(selfUrl: string, portfolioId: string, baseUrl: string, data: any) {
        return serialize(selfUrl, portfolioId, baseUrl, data)
    }

    static serializeCollection(selfUrl: string, portfolioId: string, baseUrl: string, qs: any, data: any) {
        return serializeCollection(selfUrl, portfolioId, baseUrl, qs, data)
    }
}
