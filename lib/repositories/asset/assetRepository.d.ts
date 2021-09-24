import { TAsset, TAssetCore, TAssetUpdate } from '../../models/asset';
import { CachingRepository } from '../cachingRepository';
export declare class AssetRepository extends CachingRepository {
    db: FirebaseFirestore.Firestore;
    constructor();
    filterMap: any;
    getListAsync(qs?: any): Promise<TAsset[]>;
    getDetailAsync(entityId: string): Promise<any>;
    storeAsync(entity: TAsset): Promise<void>;
    updateAsync(entityId: string, entityData: TAssetUpdate): Promise<void>;
    addMinted(entityId: string, units: number): Promise<void>;
    addBurned(entityId: string, units: number): Promise<void>;
    deleteAsync(entityId: string): Promise<void>;
    getLeagueAssetsAsync(leagueId: string): Promise<TAssetCore[]>;
    isPortfolioUsed(portfolioId: string): Promise<string | null>;
    isLeagueUsed(leagueId: string): Promise<string | null>;
}
