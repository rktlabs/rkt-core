import { IEventPublisher } from '.';
export declare class TreasuryService {
    private eventPublisher;
    private userRepository;
    private portfolioRepository;
    private portfolioService;
    private transactionService;
    constructor(eventPublisher?: IEventPublisher);
    depositCoins(userId: string, units: number, coinId?: string): Promise<void>;
    withdrawCoins(userId: string, units: number, coinId?: string): Promise<void>;
}
