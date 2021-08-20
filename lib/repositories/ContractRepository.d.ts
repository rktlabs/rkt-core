import { TContract, TContractUpdate } from '../models/contract';
export declare class ContractRepository {
    db: FirebaseFirestore.Firestore;
    constructor(db: FirebaseFirestore.Firestore);
    listContracts(qs?: any): Promise<TContract[]>;
    getContract(contractId: string): Promise<TContract | null>;
    storeContract(entity: TContract): Promise<void>;
    updateContract(contractId: string, entityData: TContractUpdate): Promise<void>;
    dropContractAsset(contractId: string, assetId: string): Promise<void>;
    addContractAsset(contractId: string, assetId: string): Promise<void>;
    deleteContract(contractId: string): Promise<void>;
}
