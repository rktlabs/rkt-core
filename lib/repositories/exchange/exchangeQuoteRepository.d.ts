import { TExchangeQuote } from '../..';
import { RepositoryBase } from '../repositoryBase';
export declare class ExchangeQuoteRepository extends RepositoryBase {
    db: FirebaseFirestore.Firestore;
    constructor();
    filterMap: any;
    getListAsync(qs?: any): Promise<TExchangeQuote[]>;
    getDetailAsync(assetId: string): Promise<TExchangeQuote | null>;
    storeAsync(assetId: string, entity: TExchangeQuote): Promise<void>;
    deleteAsync(assetId: string): Promise<void>;
}
