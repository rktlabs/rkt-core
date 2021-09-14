import { TNewPortfolioConfig, Portfolio, TPortfolioUpdate, TPortfolioDeposit } from '..';
export declare class PortfolioService {
    private portfolioRepository;
    private assetRepository;
    private makerRepository;
    private leagueRepository;
    private portfolioActivityRepository;
    private portfolioDepositRepository;
    private portfolioHoldingsService;
    constructor();
    createPortfolio(payload: TNewPortfolioConfig): Promise<Portfolio>;
    updatePortfolio(portfolioId: string, payload: TPortfolioUpdate): Promise<void>;
    deletePortfolio(portfolioId: string): Promise<void>;
    scrubPortfolio(portfolioId: string): Promise<void>;
    submitPortfolioDeposit(deposit: TPortfolioDeposit): Promise<void>;
    computePortfolioNetDeposits(portfolioId: string): Promise<number>;
    createOrKeepPortfolio(payload: TNewPortfolioConfig): Promise<any[]>;
}
