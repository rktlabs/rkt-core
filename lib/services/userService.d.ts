import { TNewUser, User } from '..';
export declare class UserService {
    private userRepository;
    private portfolioRepository;
    private portfolioService;
    constructor();
    newUser(payload: TNewUser): Promise<User>;
    deleteUser(userId: string): Promise<void>;
    scrubUser(userId: string): Promise<void>;
    private createUserImpl;
    private createUserPortfolioImpl;
}
