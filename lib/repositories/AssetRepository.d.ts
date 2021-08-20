import { TAsset, TAssetUpdate } from '..';
import { IRepository } from './IRepository';
export declare class AssetRepository implements IRepository {
    db: FirebaseFirestore.Firestore;
    constructor(db: FirebaseFirestore.Firestore);
    listAssets(qs?: any): Promise<TAsset[]>;
    getAsset(assetId: string): Promise<TAsset | null>;
    storeAsset(entity: TAsset): Promise<void>;
    updateAsset(assetId: string, entityData: TAssetUpdate): Promise<void>;
    deleteAsset(assetId: string): Promise<void>;
    adjustCumulativeEarnings(assetId: string, cumulativeEarningsDelta: number): Promise<void>;
    listContractAssets(contractId: string): Promise<string[]>;
    listEarnerAssets(earnerId: string): Promise<string[]>;
}
