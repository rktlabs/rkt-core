import { TUser, TNewUser } from './types';
export declare class User {
    createdAt: string;
    userId: string;
    id: string;
    dob: string;
    email: string;
    name: string;
    username: string;
    displayName?: string;
    tags?: any;
    portfolioId?: string;
    isNew?: boolean;
    referrerId?: string;
    constructor(props: TUser);
    toString(): string;
    static newUser(props: TNewUser): User;
    static validate(jsonPayload: any): import("jsonschema").ValidatorResult;
    static serialize(selfUrl: string, baseUrl: string, data: any): any;
    static serializeCollection(selfUrl: string, baseUrl: string, qs: any, data: any): any;
}
