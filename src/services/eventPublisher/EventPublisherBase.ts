'use strict'

import { DateTime } from 'luxon'
import * as Models from '../../models'
import * as Events from './events'
import { IEventPublisher } from './IEventPublisher'
import { IPublisher } from './publishers/iPublisher'

export class EventPublisherBase implements IEventPublisher {
    private publisher: IPublisher

    constructor(publisher: IPublisher) {
        this.publisher = publisher
    }

    ////////////////////////////////////////////////////////
    // Messages - Full objects - not events
    ////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////
    // Exchange Order Events
    ////////////////////////////////////////////////////////

    async publishExchangeOrderCreateAsync(exchangeOrder: Models.TNewExchangeOrderConfig, source?: string) {
        const event = new Events.ExchangeOrderEventNew(exchangeOrder)
        return this.publishMessage('exchangeOrderCreate', event, source)
    }

    async publishExchangeOrderCancelAsync(cancelOrder: Models.TExchangeCancelOrder, source?: string) {
        const event = new Events.ExchangeOrderEventCancel(cancelOrder)
        return this.publishMessage('exchangeOrderCreate', event, source)
    }

    ////////////////////////////////////////////////////////
    // Error Events
    ////////////////////////////////////////////////////////

    // NOT USED - keep
    async publishErrorEventAsync(error: any, sourceData?: any) {
        const event = new Events.ErrorEvent(error)
        return this.publishMessage('errorEvent', event, sourceData)
    }

    // NOT USED - keep
    async publishWarningEventAsync(error: any, sourceData?: any) {
        const event = new Events.WarningEvent(error)
        return this.publishMessage('errorEvent', event, sourceData)
    }

    ////////////////////////////////////////////////////////
    // Transaction Events
    ////////////////////////////////////////////////////////

    async publishTransactionEventCompleteAsync(transaction: Models.Transaction, source?: string) {
        const event = new Events.TransactionEventComplete({
            transactionId: transaction.transactionId,
            xids: transaction.xids,
            tags: transaction.tags,
            status: transaction.status,
        })

        return this.publishMessage('transactionEvent', event, source)
    }

    async publishTransactionEventErrorAsync(
        transaction: Models.Transaction,
        reason: string,
        source?: string,
        stack = null,
    ) {
        const event = new Events.TransactionEventError({
            transactionId: transaction.transactionId,
            xids: transaction.xids,
            status: transaction.status,
            reason,
        })
        if (!stack) {
            event.attributes.stack = stack
        }

        return this.publishMessage('transactionEvent', event, source)
    }

    ////////////////////////////////////////////////////////
    // Order Events
    ////////////////////////////////////////////////////////

    async publishOrderEventFailedAsync(portfolioId: string, orderId: string, reason: string, source?: string) {
        const event = new Events.OrderEventFailed({
            portfolioId,
            orderId,
            reason,
        })

        return this.publishMessage('orderEvent', event, source)
    }

    async publishOrderEventCompleteAsync(portfolioId: string, orderId: string, tradeId: string, source?: string) {
        const event = new Events.OrderEventComplete({
            orderId,
            portfolioId,
            tradeId,
        })

        return this.publishMessage('orderEvent', event, source)
    }

    async publishOrderEventFillAsync(
        portfolioId: string,
        orderId: string,
        filledSize: number,
        filledValue: number,
        filledPrice: number,
        sizeRemaining: number,
        source?: string,
    ) {
        const event = new Events.OrderEventFill({
            orderId,
            portfolioId,
            filledSize,
            filledValue,
            filledPrice,
            sizeRemaining,
        })

        return this.publishMessage('orderEvent', event, source)
    }

    ////////////////////////////////////////////////////////
    // Private
    ////////////////////////////////////////////////////////

    private async publishMessage(topicName: string, payload: any, source?: string) {
        payload.publishedAt = DateTime.utc().toString()
        if (source) {
            payload.source = source
        }
        return this.publisher.publishMessage(topicName, payload)
    }
}
