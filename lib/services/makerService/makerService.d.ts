import { MakerBase } from './makers/makerBase/entity';
import { IMaker } from './makers/makerBase/interfaces';
import { TNewMakerConfig } from './makers/makerBase/types';
export declare class MakerService {
    private assetRepository;
    private makerRepository;
    private portfolioRepository;
    private portfolioService;
    constructor();
    getMakerAsync(assetId: string): Promise<IMaker | null>;
    newMaker(payload: TNewMakerConfig, shouldCreatePortfolio?: boolean): Promise<MakerBase>;
    deleteMaker(assetId: string): Promise<void>;
    scrubMaker(assetId: string): Promise<void>;
    private createMakerImpl;
    private createMakerPortfolioImpl;
}
