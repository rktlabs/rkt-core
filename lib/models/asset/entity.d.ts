import { TAsset, TNewAssetConfig } from '.';
export declare class Asset {
    createdAt: string;
    type: string;
    symbol: string;
    assetId: string;
    displayName: string;
    ownerId: string;
    portfolioId?: string;
    leagueId?: string;
    leagueDisplayName?: string;
    issuedUnits: number;
    burnedUnits: number;
    subject?: string;
    tags?: any;
    xids?: any;
    quote?: any;
    constructor(props: TAsset);
    toString(): string;
    static newAsset(props: TNewAssetConfig): Asset;
    static validate(jsonPayload: any): import("jsonschema").ValidatorResult;
}
