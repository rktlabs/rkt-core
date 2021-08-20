import { TEarning } from '..';
import { IRepository } from './IRepository';
export declare class EarningsRepository implements IRepository {
    db: FirebaseFirestore.Firestore;
    constructor(db: FirebaseFirestore.Firestore);
    listEarnerEarnings(earnerId: string): Promise<TEarning[]>;
    storeEarnerEarning(earnerId: string, entity: TEarning): Promise<void>;
    listAssetEarnings(assetId: string): Promise<TEarning[]>;
    storeAssetEarning(assetId: string, entity: TEarning): Promise<void>;
}
