import { TAssetHolder } from '../models/assetHolder';
import { RepositoryBase } from './repositoryBase';
export declare class AssetHoldersRepository extends RepositoryBase {
    db: FirebaseFirestore.Firestore;
    constructor();
    listAssetHolders(assetId: string): Promise<TAssetHolder[]>;
    getAssetHolder(assetId: string, portfolioId: string): Promise<TAssetHolder | null>;
    storeAssetHolder(assetId: string, portfolioId: string, entity: TAssetHolder): Promise<void>;
    deleteAssetHolder(assetId: string, portfolioId: string): Promise<void>;
}
