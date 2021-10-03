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
export declare type TPortfolioUpdate = {
    displayName?: string;
    tags?: any;
    xids?: any;
    deposits?: any;
};
export declare type TNewPortfolioConfig = {
    type?: string;
    portfolioId?: string;
    ownerId: string;
    displayName?: string;
    tags?: any;
    xids?: any;
};
export declare type TPortfolioHolding = {
    portfolioId: string;
    assetId: string;
    units: number;
    displayName: string;
};
export declare type TAssetHolderUpdateItem = {
    assetId: string;
    portfolioId: string;
    deltaUnits: number;
    deltaValue: number;
};
export declare type TPortfolioDeposit = {
    createdAt: string;
    portfolioId: string;
    assetId: string;
    units: number;
};
