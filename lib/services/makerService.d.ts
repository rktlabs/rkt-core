import { TNewMaker, Maker } from '../models/maker';
export declare class MakerService {
    private assetRepository;
    private makerRepository;
    private portfolioCache;
    private portfolioService;
    private makerServiceFactory;
    constructor();
    newMaker(payload: TNewMaker, shouldCreatePortfolio?: boolean): Promise<Maker>;
    deleteMaker(assetId: string): Promise<void>;
    scrubMaker(assetId: string): Promise<void>;
    private createMakerImpl;
    private createMakerPortfolioImpl;
}
