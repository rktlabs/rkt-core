import { INotificationPublisher } from '.';
export declare class MintService {
    private eventPublisher;
    private assetRepository;
    private portfolioRepository;
    private transactionService;
    constructor(eventPublisher?: INotificationPublisher);
    mintUnits(assetId: string, units: number): Promise<void>;
    burnUnits(assetId: string, units: number): Promise<void>;
}
