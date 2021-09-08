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
export declare type TNewPortfolio = {
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
    cost: number;
    net: number;
};
export declare type TPortfolioHoldingUpdateItem = {
    portfolioId: string;
    assetId: string;
    deltaUnits: number;
    deltaNet: number;
    deltaCost: number;
};
export declare type TPortfolioDeposit = {
    createdAt: string;
    portfolioId: string;
    assetId: string;
    units: number;
};
