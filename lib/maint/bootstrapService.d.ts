import { IEventPublisher } from '..';
export declare class BootstrapService {
    private assetRepository;
    private portfolioRepository;
    private portfolioService;
    private leagueService;
    private portfolioHoldingsService;
    private transactionService;
    constructor(eventPublisher?: IEventPublisher);
    bootMint(): Promise<void>;
    bootTestLeague(): Promise<void>;
    bootstrap(): Promise<void>;
    setupTestAsset(): Promise<void>;
    setupAccount(): Promise<void>;
    setupTreasury(): Promise<void>;
    fullBoot(): Promise<void>;
    scrub(): Promise<void>;
    clearHoldings(): Promise<void>;
    clearDb(): Promise<void>;
}
