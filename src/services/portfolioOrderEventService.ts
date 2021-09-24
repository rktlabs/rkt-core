import { DateTime } from 'luxon'
import { TNotification } from '.'
import { PortfolioOrderRepository, TPortfolioOrder, TPortfolioOrderEvent } from '..'

import * as log4js from 'log4js'
const logger = log4js.getLogger()

export class PortfolioOrderEventService {
    private orderRepository: PortfolioOrderRepository

    constructor(db: FirebaseFirestore.Firestore) {
        this.orderRepository = new PortfolioOrderRepository()
    }

    handleOrderEventAsync = async (payload: TNotification) => {
        //logger.debug(`Handle Order TEvent: ${JSON.stringify(payload)}`)

        const orderId = payload.attributes.orderId
        const portfolioId = payload.attributes.portfolioId

        // NOTE: payload is captured in closure?
        await this.orderRepository.atomicUpdateAsync(
            portfolioId,
            orderId,
            (order: TPortfolioOrder): TPortfolioOrder | undefined => {
                return this.processOrderEvent(order, payload)
            },
        )
    }

    ////////////////////////////////////////////////////////
    // PRIVATE
    ////////////////////////////////////////////////////////

    private processOrderEvent = (order: TPortfolioOrder, payload: TNotification): TPortfolioOrder | undefined => {
        // verify that the message is not a duplicate (using messageId)
        // if it's a dup, don't process.
        const existingEvent = order.events.filter((event: TPortfolioOrderEvent) => {
            return event.messageId && event.messageId === payload.messageId
        })

        if (existingEvent.length === 0) {
            const notificationType = payload.notificationType
            switch (notificationType) {
                case 'OrderFill':
                    order = this.processFillEvent(order, payload)
                    break

                case 'OrderComplete':
                    order = this.processCompleteEvent(order, payload)
                    break

                case 'OrderFailed':
                    order = this.processFailedEvent(order, payload)
                    break
            }
            return order
        } else {
            return undefined
        }
    }

    private appendOrderEvent = (order: TPortfolioOrder, payload: TNotification) => {
        const events = order.events || []
        const orderEvent: TPortfolioOrderEvent = {
            notificationType: payload.notificationType,
            publishedAt: payload.publishedAt,
            messageId: payload.messageId,
            nonce: payload.nonce,
            attributes: payload.attributes,
        }
        events.push(orderEvent)
        order.events = events.sort((a: TPortfolioOrderEvent, b: TPortfolioOrderEvent) =>
            (a.publishedAt || '').localeCompare(b.publishedAt || ''),
        )
        return order
    }

    private close = (order: TPortfolioOrder) => {
        order.state = 'closed'
        order.closedAt = DateTime.utc().toString()
        return order
    }

    private updateStatus = (order: TPortfolioOrder, newStatus: string, reason?: string) => {
        order.status = newStatus
        if (reason) {
            order.reason = reason
        }
        return order
    }

    private processFillEvent = (order: TPortfolioOrder, payload: TNotification) => {
        // can fill whenever. don't ignore (if comes out of order)
        order.filledSize = payload.attributes.filledSize
        order.filledValue = payload.attributes.filledValue
        order.filledPrice = payload.attributes.filledPrice
        order.sizeRemaining = payload.attributes.sizeRemaining
        order = this.appendOrderEvent(order, payload)
        return order
    }

    private processFailedEvent = (order: TPortfolioOrder, payload: TNotification) => {
        switch (order.status) {
            case 'received':
                order = this.updateStatus(order, 'failed', payload.attributes.reason)
                order = this.close(order)
                break

            case 'filled':
            case 'failed':
            default:
                logger.warn(
                    `handleOrderEvent: handleFailedEvent(${order.orderId}) status: ${order.status} - ${payload} - IGNORED`,
                )
                payload.attributes.error = `order status: ${order.status} received event: ${payload.attributes.notificationType}`
                break
        }
        order = this.appendOrderEvent(order, payload)

        return order
    }

    private processCompleteEvent = (order: TPortfolioOrder, payload: TNotification) => {
        switch (order.status) {
            case 'received':
                order = this.updateStatus(order, 'filled')
                order = this.close(order)
                break

            case 'filled':
            case 'failed':
            default:
                logger.warn(`handleOrderEvent: handleFailedEvent(${order.orderId}) IGNORED`)
                payload.attributes.error = `order status: ${order.status} received event: ${payload.attributes.notificationType}`
                break
        }
        order = this.appendOrderEvent(order, payload)

        return order
    }
}
