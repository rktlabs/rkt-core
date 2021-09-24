import { AssetRepository, PortfolioRepository } from '..';
import { PortfolioOrder, TNewOrderProps } from '../models/portfolioOrder';
export declare class PortfolioOrderService {
    private orderRepository;
    private assetRepository;
    private portfolioRepository;
    constructor(assetRepository: AssetRepository, portfolioRepository: PortfolioRepository);
    createOrder(orderPayload: TNewOrderProps): Promise<PortfolioOrder>;
    unwindOrder(portfolioId: string, orderId: string): Promise<PortfolioOrder>;
    cancelOrder(portfolioId: string, orderId: string): Promise<void>;
    private generateExchangeOrder;
    private generateCancelExchangeOrder;
}
