'use strict'

import { DateTime } from 'luxon'
import { generateId } from '../../util/idGenerator'
import { ValidationError } from '../../errors'
import { validate } from './validator'
import { TPortfolioOrder } from '.'
import { TOrderInput } from '..'

export class PortfolioOrder {
    createdAt: string
    orderId: string

    orderInput: TOrderInput

    orderStatus: string
    orderState: string
    reason?: string

    events: any[]

    closedAt?: string
    executedAt?: string
    filledPrice?: number
    filledSize?: number
    filledValue?: number
    sizeRemaining?: number

    constructor(props: TPortfolioOrder) {
        this.orderId = props.orderId
        this.orderInput = props.orderInput

        this.createdAt = props.createdAt
        this.closedAt = props.closedAt
        this.executedAt = props.executedAt
        this.filledPrice = props.filledPrice
        this.filledSize = props.filledSize
        this.filledValue = props.filledValue
        this.sizeRemaining = props.sizeRemaining
        this.orderStatus = props.orderStatus
        this.orderState = props.orderState
        this.events = props.events
        this.reason = props.reason
    }

    static newOrder(orderInput: TOrderInput) {
        const createdAt = DateTime.utc().toString()

        const orderId = `ORDER::${generateId()}`
        orderInput.sourceOrderId = orderId

        const newOrderProps: TPortfolioOrder = {
            orderInput: orderInput,
            orderId: orderId,
            createdAt: createdAt,
            orderStatus: 'received', // received | filled | failed
            orderState: 'open', // open | closed
            events: [],
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
}
