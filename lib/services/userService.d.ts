import { User, TNewUser } from '../models';
import { IEventPublisher } from '../services';
export declare class UserService {
    private eventPublisher;
    private userRepository;
    private portfolioRepository;
    private portfolioCache;
    private portfolioService;
    private transactionService;
    constructor(db: FirebaseFirestore.Firestore, eventPublisher?: IEventPublisher);
    newUser(payload: TNewUser): Promise<User>;
    deleteUser(userId: string): Promise<void>;
    scrubUser(userId: string): Promise<void>;
    depositCoins(userId: string, units: number, coinId?: string): Promise<void>;
    withdrawCoins(userId: string, units: number, coinId?: string): Promise<void>;
    private createUserImpl;
    private createUserPortfolioImpl;
}
