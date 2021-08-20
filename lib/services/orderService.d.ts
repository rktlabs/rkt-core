import { Order, TNewOrderProps } from '../models';
import { IEventPublisher } from '../services';
export declare class OrderService {
    private db;
    private eventPublisher;
    private portfolioCache;
    private assetCache;
    private orderRepository;
    constructor(db: FirebaseFirestore.Firestore, eventPublisher?: IEventPublisher);
    newOrder(orderPayload: TNewOrderProps): Promise<Order>;
    unwindOrder(portfolioId: string, orderId: string): Promise<Order>;
    cancelOrder(portfolioId: string, orderId: string): Promise<void>;
    private generateExchangeOrder;
    private generateCancelExchangeOrder;
}
