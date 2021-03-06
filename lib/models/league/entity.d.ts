import { TLeague, TNewLeagueConfig } from '.';
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
    static newLeague(props: TNewLeagueConfig): League;
    static validate(jsonPayload: any): import("jsonschema").ValidatorResult;
}
