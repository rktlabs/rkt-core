import { TOrder, TOrderPatch } from '../models/portfolioOrder';
import { RepositoryBase } from './repositoryBase';
export declare class PortfolioOrdersRepository extends RepositoryBase {
    db: FirebaseFirestore.Firestore;
    constructor();
    getListAsync(portfolioId: string, filter: any): Promise<TOrder[]>;
    getDetailAsync(portfolioId: string, orderId: string): Promise<TOrder | null>;
    storeAsync(portfolioId: string, entity: TOrder): Promise<void>;
    updatePortfolioOrder(portfolioId: string, orderId: string, entityJson: TOrderPatch): Promise<void>;
    atomicUpdateO(portfolioId: string, orderId: string, func: (order: TOrder) => TOrder | undefined): Promise<void>;
}
