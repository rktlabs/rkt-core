import { INotificationPublisher } from '.';
import { AssetRepository, PortfolioRepository, TPurchase, TransactionRepository, TTransactionNew, TTransfer } from '..';
export declare class TransactionService {
    private eventPublisher;
    private portfolioRepository;
    private assetRepository;
    private assetHolderRepository;
    private transactionRepository;
    private assetHolderService;
    constructor(assetRepository: AssetRepository, portfolioRepository: PortfolioRepository, transactionRepository: TransactionRepository, eventPublisher?: INotificationPublisher);
    executePurchaseAsync(exchangeData: TPurchase): Promise<any[]>;
    executeTransferAsync(transferData: TTransfer): Promise<any[]>;
    executeTransactionAsync(transactionData: TTransactionNew): Promise<any[]>;
    private _verifyAssetsAsync;
    private _validateLegsAsync;
    private _verifyTransactionBalance;
    private _processLeg;
}
