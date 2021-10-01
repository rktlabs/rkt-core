import { TUser, TNewUserConfig } from '.';
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
    static newUser(props: TNewUserConfig): User;
    static validate(jsonPayload: any): import("jsonschema").ValidatorResult;
}
