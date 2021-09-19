import { IEventPublisher } from '.';
import { Principal } from '..';
export declare class TreasuryService {
    private eventPublisher;
    private userRepository;
    private assetHolderService;
    private portfolioRepository;
    private portfolioService;
    private transactionService;
    private mintService;
    private me;
    constructor(me: Principal, eventPublisher?: IEventPublisher);
    depositCoins(userId: string, units: number, coinId?: string): Promise<void>;
    withdrawCoins(userId: string, units: number, coinId?: string): Promise<void>;
}
