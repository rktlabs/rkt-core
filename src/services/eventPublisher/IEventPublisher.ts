/* eslint-disable no-unused-vars */

'use strict'
import * as Models from '../../models'

export interface IEventPublisher {
    ////////////////////////////////////////////////////////
    // Messages - Full objects - not events
    ////////////////////////////////////////////////////////

    // NOT USED
    // publishAssetCreateAsync(asset: Models.Asset, source?: string): Promise<void>

    // NOT USED
    // publishPortfolioCreateAsync(portfolio: Models.Portfolio, source?: string): Promise<void>

    // publishTransactionCreateAsync(transaction: Models.Transaction, source?: string): Promise<void>

    ////////////////////////////////////////////////////////
    // Exchange Order Messages
    ////////////////////////////////////////////////////////

    publishExchangeOrderCreateAsync(exchangeOrder: Models.TNewExchangeOrderConfig, source?: string): Promise<void>

    publishExchangeOrderCancelAsync(cancelOrder: Models.TExchangeCancelOrder, source?: string): Promise<void>

    ////////////////////////////////////////////////////////
    // Error Events
    ////////////////////////////////////////////////////////

    publishErrorEventAsync(error: any, sourceData?: any): Promise<void>

    publishWarningEventAsync(error: any, sourceData?: any): Promise<void>

    // NOT USED
    // publishAssetNewEventAsync(asset: Models.Asset, source?: string): Promise<void>

    // publishPortfolioNewEventAsync(portfolio: Models.Portfolio, source?: string): Promise<void>

    ////////////////////////////////////////////////////////
    // Transaction Events
    ////////////////////////////////////////////////////////

    // publishTransactionEventUpdatePortfolioAsync(
    //     transaction: Models.Transaction,
    //     leg: any,
    //     source?: string,
    // ): Promise<void>

    publishTransactionEventCompleteAsync(transaction: Models.Transaction, source?: string): Promise<void>

    publishTransactionEventErrorAsync(
        transaction: Models.Transaction,
        reason: string,
        source?: string,
        stack?: any,
    ): Promise<void>

    ////////////////////////////////////////////////////////
    // Order Events
    ////////////////////////////////////////////////////////

    publishOrderEventFailedAsync(portfolioId: string, orderId: string, reason: string, source?: string): Promise<void>

    publishOrderEventCompleteAsync(
        portfolioId: string,
        orderId: string,
        tradeId: string,
        source?: string,
    ): Promise<void>

    publishOrderEventFillAsync(
        portfolioId: string,
        orderId: string,
        filledSize: number,
        filledValue: number,
        filledPrice: number,
        sizeRemaining: number,
        source?: string,
    ): Promise<void>
}
