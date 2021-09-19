import { DateTime } from 'luxon'
import { generateId } from '../../util/idGenerator'
import { ValidationError } from '../../errors'
import { serialize, serializeCollection } from './serializer'
import { exchangeOrderValidator as validate } from './validator'
import { TExchangeOrder, TNewExchangeOrderConfig } from '.'

export class ExchangeOrder {
    operation: string // one of order, cancel
    orderType: string
    orderSide: string
    assetId: string
    portfolioId: string
    orderPrice?: number
    orderSize: number
    orderId: string
    tags?: any

    createdAt: string
    status: string
    state: string
    sizeRemaining?: number
    //canceledAt?: string
    //canceledBy?: string
    closedAt?: string
    refOrderId?: string
    error?: string

    constructor(props: TExchangeOrder) {
        this.operation = props.operation
        this.orderType = props.orderType
        this.orderSide = props.orderSide
        this.assetId = props.assetId
        this.portfolioId = props.portfolioId
        this.orderPrice = props.orderPrice
        this.orderSize = props.orderSize
        this.tags = props.tags
        this.refOrderId = props.refOrderId

        this.createdAt = props.createdAt
        this.status = props.status
        this.state = props.state
        this.orderId = props.orderId
        this.sizeRemaining = props.sizeRemaining

        this.error = props.error

        //this.canceledAt = props.canceledAt
        //this.canceledBy = props.canceledBy
        this.closedAt = props.closedAt
    }

    // Member Properties for new model
    static newExchangeOrder(props: TNewExchangeOrderConfig) {
        const orderId = props.orderId || `EXCG::${generateId()}`
        const createdAt = DateTime.utc().toString()

        const exchangeOrderProps: TExchangeOrder = {
            orderId: orderId,
            createdAt: createdAt,
            status: 'new',
            state: 'open',
            sizeRemaining: props.orderSize,

            operation: props.operation || 'order',
            orderType: props.orderType,
            orderSide: props.orderSide,
            assetId: props.assetId,
            portfolioId: props.portfolioId,
            orderPrice: props.orderPrice,
            orderSize: props.orderSize,
            tags: props.tags,
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
