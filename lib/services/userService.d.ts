import { PortfolioRepository, TNewUserConfig, User } from '..';
export declare class UserService {
    private userRepository;
    private portfolioRepository;
    private portfolioService;
    constructor(portfolioRepository: PortfolioRepository);
    createUser(payload: TNewUserConfig): Promise<User>;
    deleteUser(userId: string): Promise<void>;
    scrubUser(userId: string): Promise<void>;
    private createUserImpl;
    private createUserPortfolioImpl;
}
