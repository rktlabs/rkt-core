import { TPortfolio, TPortfolioPatch } from '..';
import { IRepository } from './IRepository';
export declare class PortfolioRepository implements IRepository {
    db: FirebaseFirestore.Firestore;
    constructor(db: FirebaseFirestore.Firestore);
    listPortfolios(qs?: any): Promise<TPortfolio[]>;
    getPortfolio(entityId: string): Promise<TPortfolio | null>;
    storePortfolio(entity: TPortfolio): Promise<void>;
    updatePortfolio(entityId: string, entityData: TPortfolioPatch): Promise<void>;
    deletePortfolio(entityId: string): Promise<void>;
}
