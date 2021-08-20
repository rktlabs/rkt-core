import { ICache } from './ICache';
import { TPortfolioCache } from '../models';
export declare class PortfolioCache implements ICache {
    db: FirebaseFirestore.Firestore;
    constructor(db: FirebaseFirestore.Firestore);
    lookupPortfolio(transactionPortfolioId: string): Promise<TPortfolioCache | null>;
}
