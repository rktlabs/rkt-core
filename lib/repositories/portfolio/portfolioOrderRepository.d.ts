import { TOrder, TOrderPatch } from '../../models/portfolioOrder';
import { RepositoryBase } from '../repositoryBase';
export declare class PortfolioOrderRepository extends RepositoryBase {
    db: FirebaseFirestore.Firestore;
    constructor();
    filterMap: any;
    getListAsync(portfolioId: string, qs?: any): Promise<TOrder[]>;
    getDetailAsync(portfolioId: string, orderId: string): Promise<TOrder | null>;
    storeAsync(portfolioId: string, entity: TOrder): Promise<void>;
    updateAsync(portfolioId: string, orderId: string, entityJson: TOrderPatch): Promise<void>;
    atomicUpdateAsync(portfolioId: string, orderId: string, func: (order: TOrder) => TOrder | undefined): Promise<void>;
}
