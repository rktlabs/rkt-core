import { TMaker, TNewMaker } from '.';
export declare class Maker {
    createdAt: string;
    type: string;
    symbol: string;
    makerId: string;
    displayName: string;
    ownerId: string;
    leagueId: string;
    leagueDisplayName: string;
    tags?: any;
    xids?: any;
    bid?: number;
    ask?: number;
    last?: number;
    constructor(props: TMaker);
    toString(): string;
    static newMaker(props: TNewMaker): Maker;
    static validate(jsonPayload: any): import("jsonschema").ValidatorResult;
    static serialize(selfUrl: string, baseUrl: string, data: any): any;
    static serializeCollection(selfUrl: string, baseUrl: string, qs: any, data: any): any;
}
