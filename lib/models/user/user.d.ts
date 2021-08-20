export declare type TNewUser = {
    userId?: string;
    dob: string;
    email: string;
    name: string;
    username: string;
    displayName?: string;
    tags?: any;
    initialCoins?: number;
    referrerId?: string;
};
export declare type TUser = {
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
};
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
    static serialize(req: any, data: any): any;
    static serializeCollection(req: any, data: any): any;
}
