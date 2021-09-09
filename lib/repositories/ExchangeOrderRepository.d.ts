import { TExchangeOrder, TExchangeOrderPatch } from '..';
import { RepositoryBase } from './repositoryBase';
export declare class ExchangeOrderRepository extends RepositoryBase {
    db: FirebaseFirestore.Firestore;
    constructor();
    getListAsync(qs?: any): Promise<TExchangeOrder[]>;
    getDetailAsync(orderId: string): Promise<TExchangeOrder | null>;
    storeExchangeOrder(entity: TExchangeOrder): Promise<void>;
    updateExchangeOrder(portfolioId: string, orderId: string, entity: TExchangeOrderPatch): Promise<void>;
    scrubExecutionOrderCollection(): Promise<void>;
}
