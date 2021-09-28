import { TransactionLeg, TTransaction, TTransactionNew } from './types';
export declare class Transaction {
    transactionId: string;
    createdAt: string;
    transactionStatus: string;
    error?: string;
    inputs: TransactionLeg[];
    outputs?: TransactionLeg[];
    tags?: any;
    xids?: any;
    constructor(props: TTransaction);
    static newTransaction(props: TTransactionNew): Transaction;
    static serialize(selfUrl: string, baseUrl: string, data: any): any;
    static serializeCollection(selfUrl: string, baseUrl: string, qs: any, data: any): any;
    static validate(jsonPayload: any): void;
    static validateTransfer(jsonPayload: any): void;
}
