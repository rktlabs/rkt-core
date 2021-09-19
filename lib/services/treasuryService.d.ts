import { IEventPublisher } from '.';
export declare class TreasuryService {
    private eventPublisher;
    private userRepository;
    private assetRepository;
    private assetHolderService;
    private portfolioRepository;
    private portfolioService;
    private transactionService;
    private mintService;
    constructor(eventPublisher?: IEventPublisher);
    mintUnits(units: number): Promise<void>;
    depositCoins(userId: string, units: number): Promise<void>;
    withdrawCoins(userId: string, units: number, coinId?: string): Promise<void>;
}
