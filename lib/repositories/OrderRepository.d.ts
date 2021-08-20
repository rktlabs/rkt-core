import { TOrder, TOrderPatch } from '..';
import { IRepository } from './IRepository';
export declare class OrderRepository implements IRepository {
    db: FirebaseFirestore.Firestore;
    constructor(db: FirebaseFirestore.Firestore);
    storePortfolioOrder(portfolioId: string, entity: TOrder): Promise<void>;
    listPortfolioOrders(portfolioId: string, filter: any): Promise<TOrder[]>;
    getPortfolioOrder(portfolioId: string, orderId: string): Promise<TOrder | null>;
    updatePortfolioOrder(portfolioId: string, orderId: string, entityJson: TOrderPatch): Promise<void>;
    atomicUpdateOrder(portfolioId: string, orderId: string, func: (order: TOrder) => TOrder | undefined): Promise<void>;
}
