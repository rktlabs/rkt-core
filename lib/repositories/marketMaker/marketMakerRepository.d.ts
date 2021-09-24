import { MarketMakerBase } from '../../services/marketMakerService/marketMakerBase/entity';
import { TMarketMaker, TMarketMakerPatch } from '../../services/marketMakerService/marketMakerBase/types';
import { RepositoryBase } from '../repositoryBase';
export declare class MarketMakerRepository extends RepositoryBase {
    db: FirebaseFirestore.Firestore;
    constructor();
    filterMap: any;
    getListAsync(qs?: any): Promise<TMarketMaker[]>;
    getDetailAsync(assetId: string): Promise<TMarketMaker | null>;
    storeAsync(entity: MarketMakerBase | TMarketMaker): Promise<void>;
    updateAsync(assetId: string, entityData: TMarketMakerPatch): Promise<void>;
    updateMakerStateAsync(assetId: string, stateUpdate: any): Promise<void>;
    deleteAsync(assetId: string): Promise<void>;
    isPortfolioUsed(portfolioId: string): Promise<string | null>;
}
