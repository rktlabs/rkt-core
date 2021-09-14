// import { DateTime } from 'luxon'
// import * as log4js from 'log4js'
// import { OrderRepository } from '../repositories'
// import { TEvent } from '../services'
// import { TOrder, TOrderEvent } from '..'
// const logger = log4js.getLogger()

// export class PortfolioOrderEventService {
//     private orderRepository: OrderRepository

//     constructor(db: FirebaseFirestore.Firestore) {
//         this.orderRepository = new OrderRepository(db)
//     }

//     handleOrderEventAsync = async (payload: TEvent) => {
//         //logger.debug(`Handle Order TEvent: ${JSON.stringify(payload)}`)

//         const orderId = payload.attributes.orderId
//         const portfolioId = payload.attributes.portfolioId

//         // NOTE: payload is captured in closure?
//         await this.orderRepository.atomicUpdateOrder(portfolioId, orderId, (order: TOrder): TOrder | undefined => {
//             return this.processOrderEvent(order, payload)
//         })
//     }

//     private processOrderEvent = (order: TOrder, payload: TEvent): TOrder | undefined => {
//         // verify that the message is not a duplicate (using messageId)
//         // if it's a dup, don't process.
//         const existingEvent = order.events.filter((event: TOrderEvent) => {
//             return event.messageId && event.messageId === payload.messageId
//         })

//         if (existingEvent.length === 0) {
//             const eventType = payload.eventType
//             switch (eventType) {
//                 case 'OrderFill':
//                     order = this.processFillEvent(order, payload)
//                     break

//                 case 'OrderComplete':
//                     order = this.processCompleteEvent(order, payload)
//                     break

//                 case 'OrderFailed':
//                     order = this.processFailedEvent(order, payload)
//                     break
//             }
//             return order
//         } else {
//             return undefined
//         }
//     }

//     private appendOrderEvent = (order: TOrder, payload: TEvent) => {
//         const events = order.events || []
//         const orderEvent: TOrderEvent = {
//             eventType: payload.eventType,
//             publishedAt: payload.publishedAt,
//             messageId: payload.messageId,
//             nonce: payload.nonce,
//             attributes: payload.attributes,
//         }
//         events.push(orderEvent)
//         order.events = events.sort((a: TOrderEvent, b: TOrderEvent) =>
//             (a.publishedAt || '').localeCompare(b.publishedAt || ''),
//         )
//         return order
//     }

//     private close = (order: TOrder) => {
//         order.state = 'closed'
//         order.closedAt = DateTime.utc().toString()
//         return order
//     }

//     private updateStatus = (order: TOrder, newStatus: string, reason?: string) => {
//         order.status = newStatus
//         if (reason) {
//             order.reason = reason
//         }
//         return order
//     }

//     private processFillEvent = (order: TOrder, payload: TEvent) => {
//         // can fill whenever. don't ignore (if comes out of order)
//         order.filledSize = payload.attributes.filledSize
//         order.filledValue = payload.attributes.filledValue
//         order.filledPrice = payload.attributes.filledPrice
//         order.sizeRemaining = payload.attributes.sizeRemaining
//         order = this.appendOrderEvent(order, payload)
//         return order
//     }

//     private processFailedEvent = (order: TOrder, payload: TEvent) => {
//         switch (order.status) {
//             case 'received':
//                 order = this.updateStatus(order, 'failed', payload.attributes.reason)
//                 order = this.close(order)
//                 break

//             case 'filled':
//             case 'failed':
//             default:
//                 logger.warn(
//                     `handleOrderEvent: handleFailedEvent(${order.orderId}) status: ${order.status} - ${payload} - IGNORED`,
//                 )
//                 payload.attributes.error = `order status: ${order.status} received event: ${payload.attributes.eventType}`
//                 break
//         }
//         order = this.appendOrderEvent(order, payload)

//         return order
//     }

//     private processCompleteEvent = (order: TOrder, payload: TEvent) => {
//         switch (order.status) {
//             case 'received':
//                 order = this.updateStatus(order, 'filled')
//                 order = this.close(order)
//                 break

//             case 'filled':
//             case 'failed':
//             default:
//                 logger.warn(`handleOrderEvent: handleFailedEvent(${order.orderId}) IGNORED`)
//                 payload.attributes.error = `order status: ${order.status} received event: ${payload.attributes.eventType}`
//                 break
//         }
//         order = this.appendOrderEvent(order, payload)

//         return order
//     }
// }
