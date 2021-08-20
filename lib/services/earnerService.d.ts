import { Earner, TEarning, TNewEarner } from '../models';
import { IEventPublisher } from '../services';
export declare class EarnerService {
    private earnerRepository;
    private earningsRepository;
    private assetRepository;
    constructor(db: FirebaseFirestore.Firestore, eventPublisher?: IEventPublisher);
    newEarner(payload: TNewEarner): Promise<Earner>;
    deleteEarner(earnerId: string): Promise<void>;
    scrubEarner(earnerId: string): Promise<void>;
    submitEarnings(earnerId: string, earning: TEarning): Promise<any[]>;
    private createEarnerImpl;
}
