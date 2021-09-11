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
    newPurchaseAsync(exchangeData: TPurchase): Promise<any[]>;
    newTransferAsync(transferData: TTransfer): Promise<any[]>;
    newTransactionAsync(transactionData: TTransactionNew): Promise<any[]>;
    mintCoinsToPortfolio(portfolioId: string, units: number, sourcePortfolioId?: string, assetId?: string): Promise<void>;
    private mintCoinsToPortfolioImpl;
    private verifyAssetsAsync;
    private validateLegsAsync;
    private verifyTransactionBalance;
    private processLeg;
}
