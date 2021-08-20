import { IEventPublisher } from '../services';
import { Maker, TNewMaker } from 'makers';
export declare class MakerService {
    private makerRepository;
    private portfolioCache;
    private portfolioService;
    private makerServiceFactory;
    constructor(db: FirebaseFirestore.Firestore, eventPublisher?: IEventPublisher);
    newMaker(payload: TNewMaker, shouldCreatePortfolio?: boolean): Promise<Maker>;
    deleteMaker(assetId: string): Promise<void>;
    scrubMaker(assetId: string): Promise<void>;
    private createMakerImpl;
    private createMakerPortfolioImpl;
}
