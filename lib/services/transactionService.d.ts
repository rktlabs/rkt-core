import { TPurchase, TTransactionNew, TTransfer } from '../models';
import { IEventPublisher } from '../services';
export declare class TransactionService {
    private eventPublisher;
    private portfolioCache;
    private assetCache;
    private portfolioAssetRepository;
    private transactionRepository;
    private portfolioAssetService;
    constructor(db: FirebaseFirestore.Firestore, eventPublisher?: IEventPublisher);
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
