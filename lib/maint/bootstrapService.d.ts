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
    bootLeague(): Promise<void>;
    bootUser(): Promise<void>;
    bootstrap(): Promise<void>;
    bootTestAsset(): Promise<void>;
    fullBoot(): Promise<void>;
    fullScrub(): Promise<void>;
    clearHoldings(): Promise<void>;
}
