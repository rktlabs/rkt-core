import { TPortfolioDeposit } from '..';
import { IRepository } from './IRepository';
export declare class PortfolioDepositRepository implements IRepository {
    db: FirebaseFirestore.Firestore;
    constructor(db: FirebaseFirestore.Firestore);
    listPortfolioDeposits(portfolioId: string): Promise<TPortfolioDeposit[]>;
    storePortfolioDeposit(portfolioId: string, entity: TPortfolioDeposit): Promise<void>;
    scrubPortfolioDeposits(portfolioId: string): Promise<void>;
}
