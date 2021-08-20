export declare type TContractEarnerDef = {
    earnerId: string;
    initialPrice: number;
    displayName: string;
};
export declare type TNewContract = {
    contractId: string;
    ownerId: string;
    displayName?: string;
    description?: string;
    startAt?: string;
    endAt?: string;
    acceptEarningsAfter?: string;
    ignoreEarningsAfter?: string;
    key?: string;
    pt?: number;
    tags?: any;
    earnerList?: TContractEarnerDef[];
};
export declare type TContract = {
    createdAt: string;
    contractId: string;
    ownerId: string;
    portfolioId: string;
    displayName: string;
    description: string;
    startAt?: string;
    endAt?: string;
    acceptEarningsAfter?: string;
    ignoreEarningsAfter?: string;
    key?: string;
    pt?: number;
    tags?: any;
    managedAssets: string[];
    currencyId: string;
    currencySource: string;
};
export declare type TContractUpdate = {
    managedAssets: string[];
};
export declare class Contract {
    createdAt: string;
    contractId: string;
    ownerId: string;
    portfolioId: string;
    displayName: string;
    description: string;
    startAt?: string;
    endAt?: string;
    acceptEarningsAfter?: string;
    ignoreEarningsAfter?: string;
    key?: string;
    pt?: number;
    tags?: any;
    managedAssets: string[];
    currencyId: string;
    currencySource: string;
    constructor(props: TContract);
    static newContract(props: TNewContract): Contract;
    static validate(jsonPayload: any): import("jsonschema").ValidatorResult;
    static serialize(req: any, data: any): any;
    static serializeCollection(req: any, data: any): any;
}
