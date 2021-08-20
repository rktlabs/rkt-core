import { TPortfolioAssetUpdateItem, TTransaction } from '../models';
import { IRepository } from './IRepository';
export declare class PortfolioActivityRepository implements IRepository {
    db: FirebaseFirestore.Firestore;
    constructor(dataSource: FirebaseFirestore.Firestore);
    listPortfolioActivity(portfolioId: string): Promise<TTransaction[]>;
    scrubPortfolioActivityCollection(portfolioId: string): Promise<void>;
    atomicUpdateTransaction(transactionId: string, updateSet: TPortfolioAssetUpdateItem[], transaction: TTransaction): Promise<void>;
}
