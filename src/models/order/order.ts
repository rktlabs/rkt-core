import { DateTime } from 'luxon'
import { generateId, generateNonce } from '../../util/idGenerator'
import { ValidationError } from '../../errors'
import { serialize, serializeCollection } from './orderSerializer'
import { validate } from './orderValidator'

export type TNewOrderProps = {
    orderId?: string
    assetId: string
    portfolioId: string
    orderSide: string
    orderSize: number
    orderType: string // market or limit
    orderPrice?: number
    tags?: any
    xids?: any
}

// a data item that is stored on the order in the events[] collection.
export type TOrderEvent = {
    eventType: string
    publishedAt: string
    nonce: string
    attributes?: any
    messageId?: string
}

export type TOrder = {
    createdAt: string
    orderId: string
    assetId: string
    portfolioId: string
    orderSide: string
    orderSize: number
    status: string
    state: string
    orderType: string
    reason?: string

    orderPrice?: number
    events: TOrderEvent[]
    tags?: any
    xids?: any
    closedAt?: string
    filledPrice?: number
    filledSize?: number
    filledValue?: number
    sizeRemaining?: number
}

export type TOrderPatch = {
    closedAt?: string
    events?: TOrderEvent[]
    filledPrice?: number
    filledSize?: number
    filledValue?: number
    status?: string
    state?: string
}

export class Order {
    createdAt: string
    orderId: string
    assetId: string
    portfolioId: string
    orderSide: string
    orderSize: number
    status: string
    state: string
    orderType: string
    reason?: string

    orderPrice?: number
    events: TOrderEvent[]
    tags?: any
    xids?: any

    closedAt?: string
    filledPrice?: number
    filledSize?: number
    filledValue?: number
    sizeRemaining?: number

    constructor(props: TOrder) {
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

    static newOrder(props: TNewOrderProps) {
        const orderId: string = props.orderId || `ORDER::${generateId()}`
        const createdAt = DateTime.utc().toString()

        // only use fields we want. ignore others.
        const orderEvent: TOrderEvent = {
            eventType: 'Created',
            publishedAt: createdAt,
            messageId: orderId,
            nonce: generateNonce(),
        }

        const newOrderProps: TOrder = {
            orderId: orderId,
            createdAt: createdAt,
            orderType: props.orderType || 'market',
            assetId: props.assetId, // required
            portfolioId: props.portfolioId, // required
            orderSide: props.orderSide, // required
            orderSize: props.orderSize, // required
            status: 'received', // received | filled | failed
            state: 'open', // open | closed
            events: [orderEvent],
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

        const newEntity = new Order(newOrderProps)

        return newEntity
    }

    static serialize(req: any, portfolioId: string, data: any) {
        return serialize(req, portfolioId, data)
    }

    static serializeCollection(req: any, portfolioId: string, data: any) {
        return serializeCollection(req, portfolioId, data)
    }

    static validate(jsonPayload: any) {
        try {
            return validate(jsonPayload)
        } catch (error) {
            throw new ValidationError(error)
        }
    }
}
