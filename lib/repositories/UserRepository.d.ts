import { TUser } from '..';
import { RepositoryBase } from './repositoryBase';
export declare class UserRepository extends RepositoryBase {
    db: FirebaseFirestore.Firestore;
    constructor();
    getListAsync(qs?: any): Promise<TUser[]>;
    getDetailAsync(userId: string): Promise<TUser | null>;
    lookupUserByUserName(username: string): Promise<TUser | null>;
    lookupUserByEmail(email: string): Promise<TUser | null>;
    storeAsync(entity: TUser): Promise<void>;
    deleteAsync(userId: string): Promise<void>;
}
