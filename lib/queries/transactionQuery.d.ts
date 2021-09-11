import { TransactionRepository } from '../repositories/transaction/transactionRepository';
export declare class TransactionQuery {
    transactionRepository: TransactionRepository;
    constructor();
    getListAsync(qs?: any): Promise<{
        data: import("..").TTransaction[];
    }>;
    getDetailAsync(id: string): Promise<import("..").TTransaction | null>;
}
