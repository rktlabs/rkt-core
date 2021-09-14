import { IEventPublisher } from '.';
import { TPurchase, TTransactionNew, TTransfer } from '..';
export declare class TransactionService {
    private eventPublisher;
    private portfolioRepository;
    private assetRepository;
    private portfolioHoldingsRepository;
    private transactionRepository;
    private portfolioHoldingsService;
    constructor(eventPublisher?: IEventPublisher);
    executePurchaseAsync(exchangeData: TPurchase): Promise<any[]>;
    executeTransferAsync(transferData: TTransfer): Promise<any[]>;
    executeTransactionAsync(transactionData: TTransactionNew): Promise<any[]>;
    mintCoinsToPortfolio(portfolioId: string, units: number, sourcePortfolioId?: string, assetId?: string): Promise<void>;
    private mintCoinsToPortfolioImpl;
    private verifyAssetsAsync;
    private validateLegsAsync;
    private verifyTransactionBalance;
    private processLeg;
}
