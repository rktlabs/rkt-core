import * as Models from '../../models';
import { IEventPublisher } from './IEventPublisher';
import { IPublisher } from './publishers/iPublisher';
export declare class EventPublisherBase implements IEventPublisher {
    private publisher;
    constructor(publisher: IPublisher);
    publishExchangeOrderCreateAsync(exchangeOrder: Models.TNewExchangeOrderConfig, source?: string): Promise<void>;
    publishExchangeOrderCancelAsync(cancelOrder: Models.TExchangeCancelOrder, source?: string): Promise<void>;
    publishErrorEventAsync(error: any, sourceData?: any): Promise<void>;
    publishWarningEventAsync(error: any, sourceData?: any): Promise<void>;
    publishTransactionEventCompleteAsync(transaction: Models.Transaction, source?: string): Promise<void>;
    publishTransactionEventErrorAsync(transaction: Models.Transaction, reason: string, source?: string, stack?: null): Promise<void>;
    publishOrderEventFailedAsync(portfolioId: string, orderId: string, reason: string, source?: string): Promise<void>;
    publishOrderEventCompleteAsync(portfolioId: string, orderId: string, tradeId: string, source?: string): Promise<void>;
    publishOrderEventFillAsync(portfolioId: string, orderId: string, filledSize: number, filledValue: number, filledPrice: number, sizeRemaining: number, source?: string): Promise<void>;
    private publishMessage;
}
