import { TAssetHolderUpdateItem, TTransaction } from '../../models';
import { RepositoryBase } from '../repositoryBase';
export declare class PortfolioActivityRepository extends RepositoryBase {
    db: FirebaseFirestore.Firestore;
    constructor();
    filterMap: any;
    getListAsync(portfolioId: string, qs?: any): Promise<TTransaction[]>;
    atomicUpdateTransactionAsync(updateSet: TAssetHolderUpdateItem[], transaction: TTransaction): Promise<void>;
}
