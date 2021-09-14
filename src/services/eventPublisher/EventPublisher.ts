// tslint:disable:no-unused-expression

'use strict'

import { DateTime } from 'luxon'
import { Logger } from 'log4js'
import { Publisher } from './Publisher'
import * as Models from '../../models'
import * as Events from './events'
import { IEventPublisher } from './IEventPublisher'

export class EventPublisher implements IEventPublisher {
    private publisher

    constructor(opts?: { publisher?: Publisher; logger?: Logger }) {
        if (opts?.publisher) {
            this.publisher = opts.publisher
        } else {
            this.publisher = new Publisher({ logger: opts?.logger })
        }
    }

    ////////////////////////////////////////////////////////
    // Messages - Full objects - not events
    ////////////////////////////////////////////////////////

    // NOT USED
    // async publishAssetCreateAsync(asset: Models.Asset, source?: string) {
    //     const event = new Events.AssetNewEvent(asset)
    //     return this.publishMessageToTopicAsync('assetCreate', event, source)
    // }

    // NOT USED
    // async publishPortfolioCreateAsync(portfolio: Models.Portfolio, source?: string) {
    //     const event = new Events.PortfolioNewEvent(portfolio)
    //     return this.publishMessageToTopicAsync('portfolioCreate', event, source)
    // }

    // async publishTransactionCreateAsync(transaction: Models.Transaction, source?: string) {
    //     const event = new Events.TransactionEventNew(transaction)
    //     return this.publishMessageToTopicAsync('transactionCreate', event, source)
    // }

    ////////////////////////////////////////////////////////
    // Exchange Order Events
    ////////////////////////////////////////////////////////

    async publishExchangeOrderCreateAsync(exchangeOrder: Models.TNewExchangeOrder, source?: string) {
        const event = new Events.ExchangeOrderEventNew(exchangeOrder)
        return this.publishMessageToTopicAsync('exchangeOrderCreate', event, source)
    }

    async publishExchangeOrderCancelAsync(cancelOrder: Models.TExchangeCancelOrder, source?: string) {
        const event = new Events.ExchangeOrderEventCancel(cancelOrder)
        return this.publishMessageToTopicAsync('exchangeOrderCreate', event, source)
    }

    ////////////////////////////////////////////////////////
    // Error Events
    ////////////////////////////////////////////////////////

    // NOT USED - keep
    async publishErrorEventAsync(error: any, sourceData?: any) {
        const event = new Events.ErrorEvent(error)
        return this.publishMessageToTopicAsync('errorEvent', event, sourceData)
    }

    // NOT USED - keep
    async publishWarningEventAsync(error: any, sourceData?: any) {
        const event = new Events.WarningEvent(error)
        return this.publishMessageToTopicAsync('errorEvent', event, sourceData)
    }

    // NOT USED
    // async publishAssetNewEventAsync(asset: Models.Asset, source?: string) {
    //     const event = new Events.AssetNewEvent({
    //         assetType: asset.type,
    //         assetId: asset.assetId,
    //         portfolioId: asset.portfolioId,
    //         xids: asset.xids,
    //         tags: asset.tags,
    //     })

    //     return this.publishMessageToTopicAsync('assetEvent', event, source)
    // }

    // async publishPortfolioNewEventAsync(portfolio: Models.Portfolio, source?: string) {
    //     const event = new Events.PortfolioNewEvent({
    //         portfolioType: portfolio.type,
    //         portfolioId: portfolio.portfolioId,
    //         xids: portfolio.xids,
    //         tags: portfolio.tags,
    //     })

    //     return this.publishMessageToTopicAsync('portfolioEvent', event, source)
    // }

    ////////////////////////////////////////////////////////
    // Transaction Events
    ////////////////////////////////////////////////////////

    // async publishTransactionEventUpdatePortfolioAsync(transaction: Models.Transaction, leg: any, source?: string) {
    //     const event = new Events.TransactionEventPortfolioUpdateEvent({
    //         transactionId: transaction.transactionId,
    //         xids: transaction.xids,
    //         portfolioId: leg.portfolioId,
    //         assetId: leg.assetId,
    //         units: leg.units,
    //         tags: transaction.tags,
    //     })

    //     return this.publishMessageToTopicAsync('transactionEvent', event, source)
    // }

    async publishTransactionEventCompleteAsync(transaction: Models.Transaction, source?: string) {
        const event = new Events.TransactionEventComplete({
            transactionId: transaction.transactionId,
            xids: transaction.xids,
            tags: transaction.tags,
            status: transaction.status,
        })

        return this.publishMessageToTopicAsync('transactionEvent', event, source)
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

        return this.publishMessageToTopicAsync('transactionEvent', event, source)
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

        return this.publishMessageToTopicAsync('orderEvent', event, source)
    }

    async publishOrderEventCompleteAsync(portfolioId: string, orderId: string, tradeId: string, source?: string) {
        const event = new Events.OrderEventComplete({
            orderId,
            portfolioId,
            tradeId,
        })

        return this.publishMessageToTopicAsync('orderEvent', event, source)
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

        return this.publishMessageToTopicAsync('orderEvent', event, source)
    }

    ////////////////////////////////////////////////////////
    // Private
    ////////////////////////////////////////////////////////

    private async publishMessageToTopicAsync(topicName: string, payload: any, source?: string) {
        payload.publishedAt = DateTime.utc().toString()
        if (source) {
            payload.source = source
        }
        return this.publisher.publishMessageToTopicAsync(topicName, payload)
    }
}
