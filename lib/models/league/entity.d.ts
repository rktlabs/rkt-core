import { TLeague, TNewLeague } from '.';
import { TAssetCore } from '..';
export declare class League {
    createdAt: string;
    leagueId: string;
    ownerId: string;
    portfolioId: string;
    displayName: string;
    description: string;
    tags?: any;
    managedAssets: TAssetCore[];
    constructor(props: TLeague);
    static newLeague(props: TNewLeague): League;
    static validate(jsonPayload: any): import("jsonschema").ValidatorResult;
    static serialize(selfUrl: string, baseUrl: string, data: any): any;
    static serializeCollection(selfUrl: string, baseUrl: string, qs: any, data: any): any;
}
