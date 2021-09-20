import { DateTime } from 'luxon'
import * as log4js from 'log4js'
import { TNotification } from '.'
import { PortfolioOrderRepository, TOrder, TOrderEvent } from '..'

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
        await this.orderRepository.atomicUpdateAsync(portfolioId, orderId, (order: TOrder): TOrder | undefined => {
            return this.processOrderEvent(order, payload)
        })
    }

    ////////////////////////////////////////////////////////
    // PRIVATE
    ////////////////////////////////////////////////////////

    private processOrderEvent = (order: TOrder, payload: TNotification): TOrder | undefined => {
        // verify that the message is not a duplicate (using messageId)
        // if it's a dup, don't process.
        const existingEvent = order.events.filter((event: TOrderEvent) => {
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

    private appendOrderEvent = (order: TOrder, payload: TNotification) => {
        const events = order.events || []
        const orderEvent: TOrderEvent = {
            notificationType: payload.notificationType,
            publishedAt: payload.publishedAt,
            messageId: payload.messageId,
            nonce: payload.nonce,
            attributes: payload.attributes,
        }
        events.push(orderEvent)
        order.events = events.sort((a: TOrderEvent, b: TOrderEvent) =>
            (a.publishedAt || '').localeCompare(b.publishedAt || ''),
        )
        return order
    }

    private close = (order: TOrder) => {
        order.state = 'closed'
        order.closedAt = DateTime.utc().toString()
        return order
    }

    private updateStatus = (order: TOrder, newStatus: string, reason?: string) => {
        order.status = newStatus
        if (reason) {
            order.reason = reason
        }
        return order
    }

    private processFillEvent = (order: TOrder, payload: TNotification) => {
        // can fill whenever. don't ignore (if comes out of order)
        order.filledSize = payload.attributes.filledSize
        order.filledValue = payload.attributes.filledValue
        order.filledPrice = payload.attributes.filledPrice
        order.sizeRemaining = payload.attributes.sizeRemaining
        order = this.appendOrderEvent(order, payload)
        return order
    }

    private processFailedEvent = (order: TOrder, payload: TNotification) => {
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

    private processCompleteEvent = (order: TOrder, payload: TNotification) => {
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
