import * as Models from '../../../models';
export interface INotificationPublisher {
    publishNotification(payload: any): Promise<void>;
    publishExchangeOrderCreateAsync(exchangeOrder: Models.TOrderSource, source?: string): Promise<void>;
    publishErrorEventAsync(error: any, sourceData?: any): Promise<void>;
    publishWarningEventAsync(error: any, sourceData?: any): Promise<void>;
    publishTransactionEventCompleteAsync(transaction: Models.Transaction, source?: string): Promise<void>;
    publishTransactionEventErrorAsync(transaction: Models.Transaction, reason: string, source?: string, stack?: any): Promise<void>;
    publishOrderEventFailedAsync(portfolioId: string, orderId: string, reason: string, source?: string): Promise<void>;
    publishOrderEventCompleteAsync(portfolioId: string, orderId: string, tradeId: string, source?: string): Promise<void>;
    publishOrderEventFillAsync(portfolioId: string, orderId: string, filledSize: number, filledValue: number, filledPrice: number, sizeRemaining: number, source?: string): Promise<void>;
}
