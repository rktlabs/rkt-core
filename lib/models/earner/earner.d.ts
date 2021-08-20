export declare type TNewEarner = {
    ownerId: string;
    symbol: string;
    displayName?: string;
    scale?: number;
    subject?: any;
    tags?: any;
    xids?: any;
};
export declare type TEarner = {
    createdAt: string;
    ownerId: string;
    type: string;
    earnerId: string;
    displayName: string;
    scale: number;
    symbol: string;
    subject?: any;
    tags?: any;
    xids?: any;
    cumulativeEarnings: number;
};
export declare type TEarnerUpdate = {
    cumulativeEarnings?: number;
};
export declare class Earner {
    createdAt: string;
    ownerId: string;
    type: string;
    earnerId: string;
    displayName: string;
    symbol: string;
    scale: number;
    subject?: any;
    tags?: any;
    xids?: any;
    cumulativeEarnings: number;
    constructor(props: TEarner);
    static newEarner(props: TNewEarner): Earner;
    static validate(jsonPayload: any): import("jsonschema").ValidatorResult;
    static serialize(req: any, data: any): any;
    static serializeCollection(req: any, data: any): any;
}
