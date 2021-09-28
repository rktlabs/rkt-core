import { UserRepository, AssetRepository, PortfolioRepository, TransactionRepository } from '..';
export declare class TreasuryService {
    private userRepository;
    private assetRepository;
    private assetHolderService;
    private portfolioRepository;
    private portfolioFactory;
    private transactionService;
    private mintService;
    constructor(assetRepository: AssetRepository, portfolioRepository: PortfolioRepository, transactionRepository: TransactionRepository, userRepository: UserRepository);
    mintUnits(units: number): Promise<void>;
    depositCoins(userId: string, units: number): Promise<void>;
    withdrawCoins(userId: string, units: number, coinId?: string): Promise<void>;
}
