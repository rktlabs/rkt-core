import { TActivityUpdateItem, TTransaction } from '../../models';
import { RepositoryBase } from '../repositoryBase';
export declare class ActivityRepository extends RepositoryBase {
    db: FirebaseFirestore.Firestore;
    constructor();
    filterMap: any;
    getPortfolioListAsync(portfolioId: string, qs?: any): Promise<TTransaction[]>;
    getAssetListAsync(assetId: string, qs?: any): Promise<TTransaction[]>;
    getPortfolioAssetListAsync(portfolioId: string, assetId: string, qs?: any): Promise<TTransaction[]>;
    getListAsync(qs?: any): Promise<TTransaction[]>;
    atomicUpdateTransactionAsync(updateSet: TActivityUpdateItem[], transaction: TTransaction): Promise<void>;
}
