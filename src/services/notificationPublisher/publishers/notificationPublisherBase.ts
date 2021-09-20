'use strict'

import * as Models from '../../../models'
import * as Notifications from '../notification'
import { INotificationPublisher } from './INotificationPublisher'

export abstract class NotificationPublisherBase implements INotificationPublisher {
    constructor() {}

    abstract publishNotification(payload: any): Promise<void>

    ////////////////////////////////////////////////////////
    // Exchange Order Notifications
    ////////////////////////////////////////////////////////

    async publishExchangeOrderCreateAsync(exchangeOrder: Models.TNewExchangeOrderConfig, source: string) {
        const notificationPayload = new Notifications.ExchangeOrderNew(source, 'exchangeOrderCreate', exchangeOrder)
        return this.publishNotification(notificationPayload)
    }

    async publishExchangeOrderCancelAsync(cancelOrder: Models.TExchangeCancelOrder, source: string) {
        const notificationPayload = new Notifications.ExchangeOrderCancel(source, 'exchangeOrderCreate', cancelOrder)
        return this.publishNotification(notificationPayload)
    }

    ////////////////////////////////////////////////////////
    // Error/Warning Notifications
    ////////////////////////////////////////////////////////

    // NOT USED - keep
    async publishErrorEventAsync(error: any, source: any) {
        const notificationPayload = new Notifications.ErrorNotification(source, 'errorLog', error)
        return this.publishNotification(notificationPayload)
    }

    // // NOT USED - keep
    async publishWarningEventAsync(warning: any, source: any) {
        const notificationPayload = new Notifications.WarningNotification(source, 'errorLog', warning)
        return this.publishNotification(notificationPayload)
    }

    ////////////////////////////////////////////////////////
    // Transaction Notifications
    ////////////////////////////////////////////////////////

    async publishTransactionEventCompleteAsync(transaction: Models.Transaction, source: string) {
        const notificationPayload = new Notifications.TransactionComplete(source, 'transactionEvent', {
            transactionId: transaction.transactionId,
            xids: transaction.xids,
            tags: transaction.tags,
            status: transaction.status,
        })

        return this.publishNotification(notificationPayload)
    }

    async publishTransactionEventErrorAsync(
        transaction: Models.Transaction,
        reason: string,
        source: string,
        stack = null,
    ) {
        const notificationPayload = new Notifications.TransactionError(source, 'transactionEvent', {
            transactionId: transaction.transactionId,
            xids: transaction.xids,
            status: transaction.status,
            reason,
        })
        if (!stack) {
            notificationPayload.attributes.stack = stack
        }

        return this.publishNotification(notificationPayload)
    }

    ////////////////////////////////////////////////////////
    // Order Notifications
    ////////////////////////////////////////////////////////

    async publishOrderEventFailedAsync(portfolioId: string, orderId: string, reason: string, source: string) {
        const notificationPayload = new Notifications.OrderFailed(source, 'orderEvent', {
            portfolioId,
            orderId,
            reason,
        })

        return this.publishNotification(notificationPayload)
    }

    async publishOrderEventCompleteAsync(portfolioId: string, orderId: string, tradeId: string, source: string) {
        const notificationPayload = new Notifications.OrderComplete(source, 'orderEvent', {
            orderId,
            portfolioId,
            tradeId,
        })

        return this.publishNotification(notificationPayload)
    }

    async publishOrderEventFillAsync(
        portfolioId: string,
        orderId: string,
        filledSize: number,
        filledValue: number,
        filledPrice: number,
        sizeRemaining: number,
        source: string,
    ) {
        const notificationPayload = new Notifications.OrderFill(source, 'orderEvent', {
            orderId,
            portfolioId,
            filledSize,
            filledValue,
            filledPrice,
            sizeRemaining,
        })

        return this.publishNotification(notificationPayload)
    }
}
