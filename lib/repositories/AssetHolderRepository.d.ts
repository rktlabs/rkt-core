import { TAssetHolder } from '../models/assetHolder';
import { RepositoryBase } from './repositoryBase';
export declare class AssetHolderRepository extends RepositoryBase {
    db: FirebaseFirestore.Firestore;
    constructor();
    storeAssetHolder(assetId: string, portfolioId: string, entity: TAssetHolder): Promise<void>;
    listAssetHolders(assetId: string): Promise<TAssetHolder[]>;
    getAssetHolder(assetId: string, portfolioId: string): Promise<TAssetHolder | null>;
    deleteAssetHolder(assetId: string, portfolioId: string): Promise<void>;
}
