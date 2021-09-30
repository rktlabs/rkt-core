import { TMarketMaker, MarketMaker } from '../..';
import { RepositoryBase } from '../repositoryBase';
export declare class MarketMakerRepository extends RepositoryBase {
    db: FirebaseFirestore.Firestore;
    constructor();
    filterMap: any;
    getListAsync(qs?: any): Promise<TMarketMaker[]>;
    getDetailAsync(assetId: string): Promise<TMarketMaker | null>;
    storeAsync(entity: MarketMaker | TMarketMaker): Promise<void>;
    updateMakerStateAsync(assetId: string, stateUpdate: any): Promise<void>;
    deleteAsync(assetId: string): Promise<void>;
    isPortfolioUsed(portfolioId: string): Promise<string | null>;
    private flattenMaker;
}
