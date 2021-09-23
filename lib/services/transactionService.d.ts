import { INotificationPublisher } from '.';
import { TPurchase, TTransactionNew, TTransfer } from '..';
export declare class TransactionService {
    private eventPublisher;
    private portfolioRepository;
    private assetRepository;
    private assetHolderRepository;
    private transactionRepository;
    private assetHolderService;
    constructor(eventPublisher?: INotificationPublisher);
    executePurchaseAsync(exchangeData: TPurchase): Promise<any[]>;
    executeTransferAsync(transferData: TTransfer): Promise<any[]>;
    executeTransactionAsync(transactionData: TTransactionNew): Promise<any[]>;
    private verifyAssetsAsync;
    private validateLegsAsync;
    private verifyTransactionBalance;
    private processLeg;
}
