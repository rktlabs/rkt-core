import { TAssetHolder } from '../../models/assetHolder';
import { RepositoryBase } from '../repositoryBase';
export declare class AssetHolderRepository extends RepositoryBase {
    db: FirebaseFirestore.Firestore;
    constructor();
    getListAsync(assetId: string): Promise<TAssetHolder[]>;
    getDetailAsync(assetId: string, portfolioId: string): Promise<TAssetHolder | null>;
    storeAsync(assetId: string, portfolioId: string, entity: TAssetHolder): Promise<void>;
    deleteAsync(assetId: string, portfolioId: string): Promise<void>;
}
