export declare class BootstrapService {
    private assetRepository;
    private userService;
    private assetService;
    private portfolioService;
    private leagueService;
    private assetHolderService;
    private eventPublisher;
    constructor();
    bootRkt(): Promise<void>;
    bootBank(): Promise<void>;
    bootTestLeague(): Promise<void>;
    bootstrap(): Promise<void>;
    bootTestAsset(): Promise<void>;
    bootUser(): Promise<void>;
    fullBoot(): Promise<void>;
    fullScrub(): Promise<void>;
    clearHoldings(): Promise<void>;
}
