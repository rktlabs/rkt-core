import { TPortfolioDeposit } from '../..';
import { RepositoryBase } from '../repositoryBase';
export declare class PortfolioDepositRepository extends RepositoryBase {
    db: FirebaseFirestore.Firestore;
    constructor();
    listPortfolioDeposits(portfolioId: string): Promise<TPortfolioDeposit[]>;
    storePortfolioDeposit(portfolioId: string, entity: TPortfolioDeposit): Promise<void>;
    scrubAsync(portfolioId: string): Promise<void>;
}
