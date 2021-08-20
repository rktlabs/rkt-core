import * as Models from '../../models';
export interface IEventPublisher {
    publishExchangeOrderCreateAsync(exchangeOrder: Models.TNewExchangeOrder, source?: string): Promise<string>;
    publishExchangeOrderCancelAsync(cancelOrder: Models.TExchangeCancelOrder, source?: string): Promise<string>;
    publishErrorEventAsync(error: any, sourceData?: any): Promise<string>;
    publishWarningEventAsync(error: any, sourceData?: any): Promise<string>;
    publishTransactionEventUpdatePortfolioAsync(transaction: Models.Transaction, leg: any, source?: string): Promise<string>;
    publishTransactionEventCompleteAsync(transaction: Models.Transaction, source?: string): Promise<string>;
    publishTransactionEventErrorAsync(transaction: Models.Transaction, reason: string, source?: string, stack?: any): Promise<string>;
    publishOrderEventFailedAsync(portfolioId: string, orderId: string, reason: string, source?: string): Promise<string>;
    publishOrderEventCompleteAsync(portfolioId: string, orderId: string, tradeId: string, source?: string): Promise<string>;
    publishOrderEventFillAsync(portfolioId: string, orderId: string, filledSize: number, filledValue: number, filledPrice: number, sizeRemaining: number, source?: string): Promise<string>;
}
