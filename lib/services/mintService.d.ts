import { AssetRepository, PortfolioRepository, TransactionRepository } from '..';
export declare class MintService {
    private assetRepository;
    private portfolioRepository;
    private transactionService;
    constructor(assetRepository: AssetRepository, portfolioRepository: PortfolioRepository, transactionRepository: TransactionRepository);
    mintUnits(assetId: string, units: number): Promise<void>;
    burnUnits(assetId: string, units: number): Promise<void>;
}
