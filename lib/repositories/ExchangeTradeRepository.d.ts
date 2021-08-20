import { TExchangeTrade } from '../models/exchangeTrade';
import { IRepository } from './iRepository';
export declare class ExchangeTradeRepository implements IRepository {
    db: FirebaseFirestore.Firestore;
    constructor(dataSource: FirebaseFirestore.Firestore);
    listExchangeTrades(qs?: any): Promise<TExchangeTrade[]>;
    getExchangeTrade(tradeId: string): Promise<TExchangeTrade | null>;
    storeExchangeTrade(entity: TExchangeTrade): Promise<string>;
    scrubExchangeTradeCollection(): Promise<void>;
}
