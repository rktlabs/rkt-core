import { TExchangeTrade } from '../models/exchangeTrade';
import { RepositoryBase } from './repositoryBase';
export declare class ExchangeTradeRepository extends RepositoryBase {
    db: FirebaseFirestore.Firestore;
    constructor();
    getListAsync(qs?: any): Promise<TExchangeTrade[]>;
    getDetailAsync(tradeId: string): Promise<TExchangeTrade | null>;
    storeExchangeTrade(entity: TExchangeTrade): Promise<string>;
    scrubExchangeTradeCollection(): Promise<void>;
}
