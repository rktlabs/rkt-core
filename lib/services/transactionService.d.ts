import { PortfolioRepository, AssetRepository, TransactionRepository, TPurchase, TTransactionNew, TTransfer } from '..';
declare type CommitState = {
    id: string;
    transactionId: string;
    portfolioId: string;
    assetId: string;
    units: number;
    value: number;
    timestamp: string;
    xids?: any;
};
export declare class TransactionService {
    private portfolioRepository;
    private assetRepository;
    private assetHolderRepository;
    private transactionRepository;
    private assetHolderService;
    constructor(assetRepository: AssetRepository, portfolioRepository: PortfolioRepository, transactionRepository: TransactionRepository);
    executePurchaseAsync(exchangeData: TPurchase): Promise<CommitState[]>;
    executeTransferAsync(transferData: TTransfer): Promise<CommitState[]>;
    executeTransactionAsync(transactionData: TTransactionNew): Promise<CommitState[]>;
    private _verifyAssetsAsync;
    private _validateLegsAsync;
    private _verifyTransactionBalance;
    private _processLeg;
}
export {};
