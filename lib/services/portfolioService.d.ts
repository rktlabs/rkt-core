import { IEventPublisher } from '../services';
import { Portfolio, TNewPortfolio, TPortfolioDeposit, TPortfolioPatch } from '../models';
export declare class PortfolioService {
    private db;
    private eventPublisher;
    private portfolioRepository;
    private portfolioActivityRepository;
    private portfolioDepositRepository;
    private portfolioCache;
    private portfolioAssetService;
    constructor(db: FirebaseFirestore.Firestore, eventPublisher?: IEventPublisher);
    newPortfolio(payload: TNewPortfolio): Promise<Portfolio>;
    createPortfolio(payload: TNewPortfolio): Promise<any[]>;
    updatePortfolio(portfolioId: string, payload: TPortfolioPatch): Promise<void>;
    deletePortfolio(portfolioId: string): Promise<void>;
    scrubPortfolio(portfolioId: string): Promise<void>;
    submitPortfolioDeposit(deposit: TPortfolioDeposit): Promise<void>;
    computePortfolioNetDeposits(portfolioId: string): Promise<number>;
}
