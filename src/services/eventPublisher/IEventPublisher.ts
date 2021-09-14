/* eslint-disable no-unused-vars */

'use strict'
import * as Models from '../../models'

export interface IEventPublisher {
    ////////////////////////////////////////////////////////
    // Messages - Full objects - not events
    ////////////////////////////////////////////////////////

    // NOT USED
    // publishAssetCreateAsync(asset: Models.Asset, source?: string): Promise<string>

    // NOT USED
    // publishPortfolioCreateAsync(portfolio: Models.Portfolio, source?: string): Promise<string>

    // publishTransactionCreateAsync(transaction: Models.Transaction, source?: string): Promise<string>

    ////////////////////////////////////////////////////////
    // Exchange Order Messages
    ////////////////////////////////////////////////////////

    publishExchangeOrderCreateAsync(exchangeOrder: Models.TNewExchangeOrder, source?: string): Promise<string>

    publishExchangeOrderCancelAsync(cancelOrder: Models.TExchangeCancelOrder, source?: string): Promise<string>

    ////////////////////////////////////////////////////////
    // Error Events
    ////////////////////////////////////////////////////////

    publishErrorEventAsync(error: any, sourceData?: any): Promise<string>

    publishWarningEventAsync(error: any, sourceData?: any): Promise<string>

    // NOT USED
    // publishAssetNewEventAsync(asset: Models.Asset, source?: string): Promise<string>

    // publishPortfolioNewEventAsync(portfolio: Models.Portfolio, source?: string): Promise<string>

    ////////////////////////////////////////////////////////
    // Transaction Events
    ////////////////////////////////////////////////////////

    // publishTransactionEventUpdatePortfolioAsync(
    //     transaction: Models.Transaction,
    //     leg: any,
    //     source?: string,
    // ): Promise<string>

    publishTransactionEventCompleteAsync(transaction: Models.Transaction, source?: string): Promise<string>

    publishTransactionEventErrorAsync(
        transaction: Models.Transaction,
        reason: string,
        source?: string,
        stack?: any,
    ): Promise<string>

    ////////////////////////////////////////////////////////
    // Order Events
    ////////////////////////////////////////////////////////

    publishOrderEventFailedAsync(portfolioId: string, orderId: string, reason: string, source?: string): Promise<string>

    publishOrderEventCompleteAsync(
        portfolioId: string,
        orderId: string,
        tradeId: string,
        source?: string,
    ): Promise<string>

    publishOrderEventFillAsync(
        portfolioId: string,
        orderId: string,
        filledSize: number,
        filledValue: number,
        filledPrice: number,
        sizeRemaining: number,
        source?: string,
    ): Promise<string>
}
