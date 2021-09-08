import { TPortfolioHoldingUpdateItem, TTransaction } from '../models';
import { RepositoryBase } from './repositoryBase';
export declare class PortfolioActivityRepository extends RepositoryBase {
    db: FirebaseFirestore.Firestore;
    constructor();
    filterMap: any;
    getListAsync(portfolioId: string, qs?: any): Promise<TTransaction[]>;
    scrubPortfolioActivityCollection(portfolioId: string): Promise<void>;
    atomicUpdateTransaction(transactionId: string, updateSet: TPortfolioHoldingUpdateItem[], transaction: TTransaction): Promise<void>;
}
