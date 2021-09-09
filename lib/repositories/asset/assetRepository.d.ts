import { RepositoryBase } from '../repositoryBase';
import { TAsset, TAssetUpdate } from '../../models/asset';
export declare class AssetRepository extends RepositoryBase {
    db: FirebaseFirestore.Firestore;
    constructor();
    filterMap: any;
    getListAsync(qs?: any): Promise<TAsset[]>;
    getDetailAsync(assetId: string): Promise<TAsset | null>;
    storeAsync(entity: TAsset): Promise<void>;
    updateAsync(assetId: string, entityData: TAssetUpdate): Promise<void>;
    deleteAsync(assetId: string): Promise<void>;
    getLeagueAssetsAsync(leagueId: string): Promise<{
        id: string;
        displayName: string;
    }[]>;
}
