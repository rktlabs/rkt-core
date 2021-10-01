export declare type TPortfolioActivity = {
    createdAt: string;
    assetId: string;
    portfolioId: string;
    units: number;
    transactionId: string;
    orderId?: string;
    orderPortfolioId?: string;
    source?: string;
    tradeId?: string;
};
