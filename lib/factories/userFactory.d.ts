import { UserRepository, PortfolioRepository, TNewUserConfig, User } from '..';
export declare class UserFactory {
    private userRepository;
    private portfolioRepository;
    private portfolioFactory;
    constructor(portfolioRepository: PortfolioRepository, userRepository: UserRepository);
    createUser(payload: TNewUserConfig): Promise<User>;
    deleteUser(userId: string): Promise<void>;
    private _createUserImpl;
    private _createUserPortfolioImpl;
}
