import { TEarner } from '..';
import { IRepository } from './IRepository';
export declare class EarnerRepository implements IRepository {
    db: FirebaseFirestore.Firestore;
    constructor(db: FirebaseFirestore.Firestore);
    listEarners(qs?: any): Promise<TEarner[]>;
    getEarner(earnerId: string): Promise<TEarner | null>;
    storeEarner(entity: TEarner): Promise<void>;
    adjustCumulativeEarnings(earnerId: string, cumulativeEarningsDelta: number): Promise<void>;
    deleteEarner(earnerId: string): Promise<void>;
}
