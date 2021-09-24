import { TUser } from '../..';
import { CacheableRepository } from '../cacheableRepository';
export declare class UserRepository extends CacheableRepository {
    db: FirebaseFirestore.Firestore;
    constructor();
    filterMap: any;
    getListAsync(qs?: any): Promise<TUser[]>;
    getDetailAsync(userId: string): Promise<TUser | null>;
    lookupUserByUserNameAsync(username: string): Promise<TUser | null>;
    lookupUserByEmailAsync(email: string): Promise<TUser | null>;
    storeAsync(entity: TUser): Promise<void>;
    deleteAsync(userId: string): Promise<void>;
    isPortfolioUsed(portfolioId: string): Promise<string | null>;
}
