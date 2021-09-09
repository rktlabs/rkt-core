import { TExchangeQuote } from '..';
import { RepositoryBase } from './repositoryBase';
export declare class ExchangeQuoteRepository extends RepositoryBase {
    db: FirebaseFirestore.Firestore;
    constructor();
    getDetailAsync(assetId: string): Promise<TExchangeQuote | null>;
    storeExchangeQuote(assetId: string, entity: TExchangeQuote): Promise<void>;
    deleteExchangeQuote(assetId: string): Promise<void>;
}
