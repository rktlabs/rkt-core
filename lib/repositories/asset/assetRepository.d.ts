import { RepositoryBase } from '../repositoryBase';
import { TAsset, TAssetCore, TAssetUpdate } from '../../models/asset';
export declare class AssetRepository extends RepositoryBase {
    db: FirebaseFirestore.Firestore;
    constructor();
    filterMap: any;
    getListAsync(qs?: any): Promise<TAsset[]>;
    getDetailAsync(assetId: string): Promise<TAsset | null>;
    storeAsync(entity: TAsset): Promise<void>;
    updateAsync(assetId: string, entityData: TAssetUpdate): Promise<void>;
    deleteAsync(assetId: string): Promise<void>;
    getLeagueAssetsAsync(leagueId: string): Promise<TAssetCore[]>;
    isPortfolioUsed(portfolioId: string): Promise<string | null>;
    isLeagueUsed(leagueId: string): Promise<string | null>;
}
