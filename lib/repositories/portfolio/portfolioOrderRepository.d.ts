import { TPortfolioOrder, TPortfolioOrderPatch } from '../../models/portfolioOrder';
import { RepositoryBase } from '../repositoryBase';
export declare class PortfolioOrderRepository extends RepositoryBase {
    db: FirebaseFirestore.Firestore;
    constructor();
    filterMap: any;
    getListAsync(portfolioId: string, qs?: any): Promise<TPortfolioOrder[]>;
    getDetailAsync(portfolioId: string, orderId: string): Promise<TPortfolioOrder | null>;
    storeAsync(portfolioId: string, entity: TPortfolioOrder): Promise<void>;
    updateAsync(portfolioId: string, orderId: string, entityJson: TPortfolioOrderPatch): Promise<void>;
    atomicUpdateAsync(portfolioId: string, orderId: string, func: (order: TPortfolioOrder) => TPortfolioOrder | undefined): Promise<void>;
}
