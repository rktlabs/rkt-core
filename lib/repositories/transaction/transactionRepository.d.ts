import { TTransaction, TTransactionPatch } from '../../models/transaction';
import { RepositoryBase } from '../repositoryBase';
export declare class TransactionRepository extends RepositoryBase {
    db: FirebaseFirestore.Firestore;
    constructor();
    filterMap: any;
    getListAsync(qs?: any): Promise<TTransaction[]>;
    getDetailAsync(transactionId: string): Promise<TTransaction | null>;
    storeAsync(entity: TTransaction): Promise<void>;
    updateAsync(transactionId: string, entityData: TTransactionPatch): Promise<void>;
}
