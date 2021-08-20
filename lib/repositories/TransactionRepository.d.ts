import { TTransaction, TTransactionPatch } from '../models/transaction';
import { IRepository } from './IRepository';
export declare class TransactionRepository implements IRepository {
    db: FirebaseFirestore.Firestore;
    constructor(db: FirebaseFirestore.Firestore);
    listTransactions(qs?: any): Promise<TTransaction[]>;
    getTransaction(transactionId: string): Promise<TTransaction | null>;
    storeTransaction(entity: TTransaction): Promise<void>;
    updateTransaction(transactionId: string, entityData: TTransactionPatch): Promise<void>;
    scrubTransactionCollection(): Promise<void>;
}
