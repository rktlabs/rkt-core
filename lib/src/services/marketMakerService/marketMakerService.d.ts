import { IMarketMaker, TNewMarketMakerConfig, MarketMakerBase, TOrder, TOrderConfig } from '.';
export declare class MarketMakerService {
    private marketMakerRepository;
    private portfolioRepository;
    private portfolioService;
    constructor();
    getMakerAsync(assetId: string): Promise<IMarketMaker | null>;
    createMarketMaker(payload: TNewMarketMakerConfig, shouldCreatePortfolio?: boolean): Promise<MarketMakerBase>;
    deleteMaker(assetId: string): Promise<void>;
    scrubMarketMaker(assetId: string): Promise<void>;
    static generateOrder(opts: TOrderConfig): TOrder;
    private createMarketMakerImpl;
    private createMarketMakerPortfolioImpl;
}
