import { IEventPublisher } from '.';
import { TNewUserConfig, User } from '..';
export declare class UserService {
    private eventPublisher;
    private userRepository;
    private portfolioRepository;
    private portfolioService;
    private transactionService;
    constructor(eventPublisher?: IEventPublisher);
    createUser(payload: TNewUserConfig): Promise<User>;
    deleteUser(userId: string): Promise<void>;
    scrubUser(userId: string): Promise<void>;
    depositCoins(userId: string, units: number, coinId?: string): Promise<void>;
    withdrawCoins(userId: string, units: number, coinId?: string): Promise<void>;
    private createUserImpl;
    private createUserPortfolioImpl;
}
