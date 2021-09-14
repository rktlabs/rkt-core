import { IEventPublisher } from '..';
export declare class BootstrapService {
    private assetRepository;
    private portfolioRepository;
    private assetService;
    private portfolioService;
    private leagueService;
    private portfolioHoldingsService;
    private transactionService;
    constructor(eventPublisher?: IEventPublisher);
    createRkt(): Promise<void>;
    bootTestLeague(): Promise<void>;
    bootstrap(): Promise<void>;
    setupTestAsset(): Promise<void>;
    setupAccount(): Promise<void>;
    setupTreasury(): Promise<void>;
    fullBoot(): Promise<void>;
    fullScrub(): Promise<void>;
    clearHoldings(): Promise<void>;
}