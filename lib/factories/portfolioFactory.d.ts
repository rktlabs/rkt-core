import { PortfolioRepository, TNewPortfolioConfig, Portfolio, TPortfolioUpdate, TPortfolioDeposit } from '..';
export declare class PortfolioFactory {
    private portfolioRepository;
    private portfolioDepositRepository;
    constructor(portfolioRepository: PortfolioRepository);
    createPortfolio(payload: TNewPortfolioConfig): Promise<Portfolio>;
    createOrKeepPortfolio(payload: TNewPortfolioConfig): Promise<any>;
    updatePortfolio(portfolioId: string, payload: TPortfolioUpdate): Promise<void>;
    deletePortfolio(portfolioId: string): Promise<void>;
    scrubPortfolio(portfolioId: string): Promise<void>;
    recordPortfolioDeposit(deposit: TPortfolioDeposit): Promise<void>;
    computePortfolioNetDeposits(portfolioId: string): Promise<number>;
    private _createPortfolioImpl;
}
