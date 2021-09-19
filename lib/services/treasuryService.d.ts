import { IEventPublisher } from '.';
export declare class TreasuryService {
    private eventPublisher;
    private userRepository;
    private assetHolderService;
    private portfolioRepository;
    private portfolioService;
    private transactionService;
    private mintService;
    constructor(eventPublisher?: IEventPublisher);
    depositCoins(userId: string, units: number, coinId?: string): Promise<void>;
    withdrawCoins(userId: string, units: number, coinId?: string): Promise<void>;
}
