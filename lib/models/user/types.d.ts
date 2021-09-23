export declare type TNewUserConfig = {
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
