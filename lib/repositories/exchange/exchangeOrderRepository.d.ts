import { TExchangeOrder, TExchangeOrderPatch } from '../..';
import { RepositoryBase } from '../repositoryBase';
export declare class ExchangeOrderRepository extends RepositoryBase {
    db: FirebaseFirestore.Firestore;
    constructor();
    filterMap: any;
    getListAsync(qs?: any): Promise<TExchangeOrder[]>;
    getDetailAsync(orderId: string): Promise<TExchangeOrder | null>;
    storeAsync(entity: TExchangeOrder): Promise<void>;
    updateAsync(orderId: string, entity: TExchangeOrderPatch): Promise<void>;
}
