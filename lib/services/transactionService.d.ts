import { PortfolioRepository, AssetRepository, TransactionRepository, TPurchase, TTransactionNew, TTransfer } from '..';
export declare class TransactionService {
    private portfolioRepository;
    private assetRepository;
    private assetHolderRepository;
    private transactionRepository;
    private assetHolderService;
    constructor(assetRepository: AssetRepository, portfolioRepository: PortfolioRepository, transactionRepository: TransactionRepository);
    executePurchaseAsync(exchangeData: TPurchase): Promise<any[]>;
    executeTransferAsync(transferData: TTransfer): Promise<any[]>;
    executeTransactionAsync(transactionData: TTransactionNew): Promise<any[]>;
    private _verifyAssetsAsync;
    private _validateLegsAsync;
    private _verifyTransactionBalance;
    private _processLeg;
}
