import { TExchangeTrade } from '../../models/exchangeTrade';
import { RepositoryBase } from '../repositoryBase';
export declare class ExchangeTradeRepository extends RepositoryBase {
    db: FirebaseFirestore.Firestore;
    constructor();
    filterMap: any;
    getListAsync(qs?: any): Promise<TExchangeTrade[]>;
    getDetailAsync(tradeId: string): Promise<TExchangeTrade | null>;
    storeAsync(entity: TExchangeTrade): Promise<string>;
    scrubCollectionAsync(): Promise<void>;
}
