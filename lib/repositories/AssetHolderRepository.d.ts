import { IRepository } from './IRepository';
import { TAssetHolder } from '..';
export declare class AssetHolderRepository implements IRepository {
    db: FirebaseFirestore.Firestore;
    constructor(db: FirebaseFirestore.Firestore);
    storeAssetHolder(assetId: string, portfolioId: string, entity: TAssetHolder): Promise<void>;
    listAssetHolders(assetId: string): Promise<TAssetHolder[]>;
    getAssetHolder(assetId: string, portfolioId: string): Promise<TAssetHolder | null>;
    deleteAssetHolder(assetId: string, portfolioId: string): Promise<void>;
}
