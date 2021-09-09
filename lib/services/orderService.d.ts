import { TNewOrderProps } from '../models/portfolioOrder';
export declare class OrderService {
    constructor();
    newOrder(orderPayload: TNewOrderProps): Promise<TNewOrderProps>;
    cancelOrder(portfolioId: string, orderId: string): Promise<{
        portfolioId: string;
        orderId: string;
    }>;
}
