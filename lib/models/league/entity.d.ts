import { TLeague, TNewLeague } from '.';
export declare class League {
    createdAt: string;
    leagueId: string;
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
    constructor(props: TLeague);
    static newLeague(props: TNewLeague): League;
    static validate(jsonPayload: any): import("jsonschema").ValidatorResult;
    static serialize(selfUrl: string, baseUrl: string, data: any): any;
    static serializeCollection(selfUrl: string, baseUrl: string, qs: any, data: any): any;
}
