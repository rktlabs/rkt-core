import { IEventPublisher } from '../services';
export declare class BootstrapService {
    private db;
    private earnerRepository;
    private assetRepository;
    private portfolioRepository;
    private portfolioService;
    private earnerService;
    private contractService;
    private portfolioAssetService;
    private transactionService;
    constructor(db: FirebaseFirestore.Firestore, eventPublisher?: IEventPublisher);
    bootMint(): Promise<void>;
    bootTestContract(): Promise<void>;
    bootstrap(): Promise<void>;
    setupTestAsset(): Promise<void>;
    setupAccount(): Promise<void>;
    setupTreasury(): Promise<void>;
    fullBoot(): Promise<void>;
    scrub(): Promise<void>;
    clearHoldings(): Promise<void>;
    clearDb(): Promise<void>;
}
