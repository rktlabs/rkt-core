export declare type TPurchase = {
    buyerPorfolioId: string;
    sellerPortfolioId: string;
    assetId: string;
    units: number;
    coins: number;
    tags?: any;
};
export declare type TTransfer = {
    inputPortfolioId: string;
    outputPortfolioId: string;
    assetId: string;
    units: number;
    tags?: any;
};
export declare type TNewTransactionLeg = {
    assetId: string;
    portfolioId: string;
    units: number;
    value?: number;
};
export declare type TTransactionNew = {
    inputs: TNewTransactionLeg[];
    outputs?: TNewTransactionLeg[];
    tags?: any;
    xids?: any;
};
export declare type TransactionLeg = {
    assetId: string;
    portfolioId: string;
    units: number;
    value?: number;
};
export declare type TTransaction = {
    transactionId: string;
    createdAt: string;
    transactionStatus: string;
    error?: string;
    inputs: TransactionLeg[];
    outputs?: TransactionLeg[];
    tags?: any;
    xids?: any;
};
export declare type TTransactionPatch = {
    transactionStatus: string;
    error?: string;
};
