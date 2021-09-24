import { INotificationPublisher } from '.';
import { PortfolioRepository, AssetRepository } from '..';
export declare class TreasuryService {
    private eventPublisher;
    private userRepository;
    private assetRepository;
    private assetHolderService;
    private portfolioRepository;
    private portfolioService;
    private transactionService;
    private mintService;
    constructor(assetRepository: AssetRepository, portfolioRepository: PortfolioRepository, eventPublisher?: INotificationPublisher);
    mintUnits(units: number): Promise<void>;
    depositCoins(userId: string, units: number): Promise<void>;
    withdrawCoins(userId: string, units: number, coinId?: string): Promise<void>;
}
