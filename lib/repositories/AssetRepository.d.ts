import { RepositoryBase } from './repositoryBase';
import { TAsset, TAssetUpdate } from '../models/asset';
export declare class AssetRepository extends RepositoryBase {
    db: FirebaseFirestore.Firestore;
    constructor();
    filterMap: any;
    getListAsync(qs?: any): Promise<TAsset[]>;
    getDetailAsync(assetId: string): Promise<TAsset | null>;
    storeAssetAsync(entity: TAsset): Promise<void>;
    updateAssetAsync(assetId: string, entityData: TAssetUpdate): Promise<void>;
    deleteAssetAsync(assetId: string): Promise<void>;
    getLeagueAssetsAsync(leagueId: string): Promise<{
        id: string;
        displayName: string;
    }[]>;
}
