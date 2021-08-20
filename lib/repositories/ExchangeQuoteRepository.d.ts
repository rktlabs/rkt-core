import { TExchangeQuote } from '..';
import { IRepository } from './IRepository';
export declare class ExchangeQuoteRepository implements IRepository {
    db: FirebaseFirestore.Firestore;
    constructor(db: FirebaseFirestore.Firestore);
    storeExchangeQuote(assetId: string, entity: TExchangeQuote): Promise<void>;
    listExchangeQuotes(qs?: any): Promise<TExchangeQuote[]>;
    getExchangeQuote(assetId: string): Promise<TExchangeQuote | null>;
    getExchangeQuotes(assetList: string[]): Promise<(TExchangeQuote | null)[]>;
    deleteExchangeQuote(assetId: string): Promise<void>;
}
