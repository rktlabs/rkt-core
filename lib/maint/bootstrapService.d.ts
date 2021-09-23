export declare class BootstrapService {
    private userService;
    private assetService;
    private portfolioService;
    private leagueService;
    private marketMakerService;
    constructor();
    bootRkt(): Promise<void>;
    bootBank(): Promise<void>;
    bootLeague(): Promise<void>;
    bootUser(): Promise<void>;
    bootAssets(): Promise<void>;
    bootAsset(assetId: string): Promise<void>;
    bootstrap(): Promise<void>;
    fullBoot(): Promise<void>;
}
