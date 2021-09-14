import { TNewUserConfig, User } from '..';
export declare class UserService {
    private userRepository;
    private portfolioRepository;
    private portfolioService;
    constructor();
    createUser(payload: TNewUserConfig): Promise<User>;
    deleteUser(userId: string): Promise<void>;
    scrubUser(userId: string): Promise<void>;
    private createUserImpl;
    private createUserPortfolioImpl;
}
