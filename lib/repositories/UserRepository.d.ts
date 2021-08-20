import { TUser } from '..';
import { IRepository } from './IRepository';
export declare class UserRepository implements IRepository {
    db: FirebaseFirestore.Firestore;
    constructor(db: FirebaseFirestore.Firestore);
    listUsers(qs?: any): Promise<TUser[]>;
    getUser(userId: string): Promise<TUser | null>;
    lookupUserByUserName(username: string): Promise<TUser | null>;
    lookupUserByEmail(email: string): Promise<TUser | null>;
    storeUser(entity: TUser): Promise<void>;
    deleteUser(userId: string): Promise<void>;
}
