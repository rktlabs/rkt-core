import { DateTime } from 'luxon'
import { generateId } from '../../util/idGenerator'
import { ValidationError } from '../../errors'
import { serialize, serializeCollection } from './exchangeOrderSerializer'
import { exchangeOrderValidator as validate } from './exchangeOrderValidator'

export type TExchangeCancelOrder = {
    operation: string
    assetId: string
    portfolioId: string
    orderId: string
    refOrderId: string
}

export type TNewExchangeOrder = {
    operation: string // one of order, cancel
    orderType: string // market or limit
    orderSide: string
    assetId: string
    portfolioId: string
    orderPrice?: number
    orderSize: number
    orderId: string
    tags?: any
    //refOrderId?: string
}

export type TExchangeOrder = {
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
    refOrderId?: string
    closedAt?: string
    error?: string

    // reason?: string
    // executedAt?: string
    // filledPrice?: number
    // filledSize?: number
    // filledValue?: number
}

export type TExchangeOrderPatch = {
    status?: string
    state?: string
    closedAt?: string
    executedAt?: string
    reason?: string
    sizeRemaining?: number
    filledPrice?: number
    filledSize?: number
    filledValue?: number
}

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
    static newExchangeOrder(props: TNewExchangeOrder) {
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

    static serialize(req: any, data: any) {
        return serialize(req, data)
    }

    static serializeCollection(req: any, data: any) {
        return serializeCollection(req, data)
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
