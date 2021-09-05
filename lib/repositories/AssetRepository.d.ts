import { RepositoryBase } from './repositoryBase';
import { TAsset, TAssetUpdate } from '..';
export declare class AssetRepository extends RepositoryBase {
    db: FirebaseFirestore.Firestore;
    constructor();
    filterMap: any;
    listAssets(qs?: any): Promise<TAsset[]>;
    getAsset(assetId: string): Promise<TAsset | null>;
    storeAsset(entity: TAsset): Promise<void>;
    updateAsset(assetId: string, entityData: TAssetUpdate): Promise<void>;
    deleteAsset(assetId: string): Promise<void>;
}
