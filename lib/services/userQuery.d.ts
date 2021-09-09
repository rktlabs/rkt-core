import { UserRepository } from '../repositories/user/userRepository';
export declare class UserQuery {
    userRepository: UserRepository;
    constructor();
    getListAsync(qs?: any): Promise<{
        data: import("..").TUser[];
    }>;
    getDetailAsync(id: string): Promise<import("..").TUser | null>;
}
