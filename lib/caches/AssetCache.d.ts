import { TAssetCache } from '../models';
import { ICache } from './ICache';
export declare class AssetCache implements ICache {
    db: FirebaseFirestore.Firestore;
    constructor(db: FirebaseFirestore.Firestore);
    lookupAsset(assetId: string): Promise<TAssetCache | null>;
}
