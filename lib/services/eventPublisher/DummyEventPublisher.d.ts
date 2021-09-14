import * as Models from '../../models';
import { IEventPublisher } from './IEventPublisher';
export declare class DummyEventPublisher implements IEventPublisher {
    publishExchangeOrderCreateAsync(exchangeOrder: Models.TNewExchangeOrder, source?: string): Promise<string>;
    publishExchangeOrderCancelAsync(cancelOrder: Models.TExchangeCancelOrder, source?: string): Promise<string>;
    publishErrorEventAsync(error: any, sourceData?: any): Promise<string>;
    publishWarningEventAsync(error: any, sourceData?: any): Promise<string>;
    publishTransactionEventCompleteAsync(transaction: Models.Transaction, source?: string): Promise<string>;
    publishTransactionEventErrorAsync(transaction: Models.Transaction, reason: string, source?: string, stack?: null): Promise<string>;
    publishOrderEventFailedAsync(portfolioId: string, orderId: string, reason: string, source?: string): Promise<string>;
    publishOrderEventCompleteAsync(portfolioId: string, orderId: string, tradeId: string, source?: string): Promise<string>;
    publishOrderEventFillAsync(portfolioId: string, orderId: string, filledSize: number, filledValue: number, filledPrice: number, sizeRemaining: number, source?: string): Promise<string>;
    private publishMessageToTopicAsync;
}
