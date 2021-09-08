import { TPortfolioHoldingUpdateItem, TTransaction } from '../models';
import { RepositoryBase } from './repositoryBase';
export declare class PortfolioActivityRepository extends RepositoryBase {
    db: FirebaseFirestore.Firestore;
    constructor();
    listPortfolioActivity(portfolioId: string): Promise<TTransaction[]>;
    scrubPortfolioActivityCollection(portfolioId: string): Promise<void>;
    atomicUpdateTransaction(transactionId: string, updateSet: TPortfolioHoldingUpdateItem[], transaction: TTransaction): Promise<void>;
}
