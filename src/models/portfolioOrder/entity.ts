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
    portfolioId: string
    orderSide: OrderSide
    orderSize: number
    status: string
    state: string
    orderType: OrderType
    reason?: string

    orderPrice?: number
    events: any[]
    tags?: any
    xids?: any

    closedAt?: string
    filledPrice?: number
    filledSize?: number
    filledValue?: number
    sizeRemaining?: number

    constructor(props: TPortfolioOrder) {
        this.createdAt = props.createdAt
        this.orderId = props.orderId
        this.assetId = props.assetId
        this.closedAt = props.closedAt
        this.filledPrice = props.filledPrice
        this.filledSize = props.filledSize
        this.filledValue = props.filledValue
        this.sizeRemaining = props.sizeRemaining
        this.portfolioId = props.portfolioId
        this.orderSide = props.orderSide
        this.orderSize = props.orderSize
        this.status = props.status
        this.state = props.state
        this.orderType = props.orderType
        this.orderPrice = props.orderPrice
        this.events = props.events
        this.tags = props.tags
        this.xids = props.xids
        this.reason = props.reason
    }

    static newOrder(props: TNewPortfolioOrderProps) {
        const orderId: string = props.orderId || `ORDER::${generateId()}`
        const createdAt = DateTime.utc().toString()

        // only use fields we want. ignore others.
        // const orderEvent: TNewPortfolioOrderEvent = {
        //     eventType: 'Created',
        //     publishedAt: createdAt,
        //     messageId: orderId,
        //     nonce: generateNonce(),
        // }

        const newOrderProps: TPortfolioOrder = {
            orderId: orderId,
            createdAt: createdAt,
            orderType: props.orderType || 'market',
            assetId: props.assetId, // required
            portfolioId: props.portfolioId, // required
            orderSide: props.orderSide, // required
            orderSize: props.orderSize, // required
            status: 'received', // received | filled | failed
            state: 'open', // open | closed
            events: [],
        }

        // limit order requires orderPrice
        if (props.orderPrice) {
            newOrderProps.orderPrice = props.orderPrice
        }

        if (props.xids) {
            newOrderProps.xids = props.xids
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
