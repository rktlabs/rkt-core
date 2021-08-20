export declare type TNewPortfolio = {
    type?: string;
    portfolioId?: string;
    ownerId: string;
    displayName?: string;
    tags?: any;
    xids?: any;
};
export declare type TPortfolioCache = {
    portfolioId: string;
};
export declare type TPortfolioAsset = {
    portfolioId: string;
    assetId: string;
    units: number;
    displayName: string;
    cost: number;
    net: number;
};
export declare type TPortfolioDeposit = {
    createdAt: string;
    portfolioId: string;
    assetId: string;
    units: number;
};
export declare type TPortfolioAssetUpdateItem = {
    portfolioId: string;
    assetId: string;
    deltaUnits: number;
    deltaNet: number;
    deltaCost: number;
};
export declare type TPortfolioAssetCache = {
    portfolioId: string;
    assetId: string;
    units: number;
};
export declare type TPortfolio = {
    portfolioId: string;
    createdAt: string;
    type: string;
    displayName: string;
    ownerId: string;
    tags?: any;
    xids?: any;
    deposits?: number;
};
export declare type TPortfolioPatch = {
    displayName?: string;
    tags?: any;
    xids?: any;
    deposits?: any;
};
export declare class Portfolio {
    portfolioId: string;
    createdAt: string;
    type: string;
    displayName: string;
    ownerId: string;
    tags?: any;
    xids?: any;
    deposits?: number;
    constructor(props: TPortfolio);
    static newPortfolio(props: TNewPortfolio): Portfolio;
    static serialize(req: any, data: any): any;
    static serializeCollection(req: any, data: any): any;
    static validate(jsonPayload: any): import("jsonschema").ValidatorResult;
}
