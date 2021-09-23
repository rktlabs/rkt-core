import { TPortfolio, TNewPortfolioConfig } from '.';
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
    static newPortfolio(props: TNewPortfolioConfig): Portfolio;
    static validate(jsonPayload: any): import("jsonschema").ValidatorResult;
    static serialize(selfUrl: string, baseUrl: string, data: any): any;
    static serializeCollection(selfUrl: string, baseUrl: string, qs: any, data: any): any;
}
