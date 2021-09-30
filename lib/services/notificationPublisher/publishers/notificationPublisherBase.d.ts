import * as Models from '../../../models';
import { INotificationPublisher } from './INotificationPublisher';
export declare abstract class NotificationPublisherBase implements INotificationPublisher {
    constructor();
    abstract publishNotification(payload: any): Promise<void>;
    publishExchangeOrderCreateAsync(exchangeOrder: Models.TOrderSource, source: string): Promise<void>;
    publishErrorEventAsync(error: any, source: any): Promise<void>;
    publishWarningEventAsync(warning: any, source: any): Promise<void>;
    publishTransactionEventCompleteAsync(transaction: Models.Transaction, source: string): Promise<void>;
    publishTransactionEventErrorAsync(transaction: Models.Transaction, reason: string, source: string, stack?: null): Promise<void>;
    publishOrderEventFailedAsync(portfolioId: string, orderId: string, reason: string, source: string): Promise<void>;
    publishOrderEventCompleteAsync(portfolioId: string, orderId: string, tradeId: string, source: string): Promise<void>;
    publishOrderEventFillAsync(portfolioId: string, orderId: string, filledSize: number, filledValue: number, filledPrice: number, sizeRemaining: number, source: string): Promise<void>;
}
