import { TExchangeOrder, TExchangeOrderPatch } from '..';
import { IRepository } from './iRepository';
export declare class ExchangeOrderRepository implements IRepository {
    db: FirebaseFirestore.Firestore;
    constructor(dataSource: FirebaseFirestore.Firestore);
    listsExchangeOrders(qs?: any): Promise<TExchangeOrder[]>;
    getExchangeOrder(portfolioId: string, orderId: string): Promise<TExchangeOrder | null>;
    storeExchangeOrder(entity: TExchangeOrder): Promise<void>;
    updateExchangeOrder(portfolioId: string, orderId: string, entity: TExchangeOrderPatch): Promise<void>;
    scrubExecutionOrderCollection(): Promise<void>;
}
