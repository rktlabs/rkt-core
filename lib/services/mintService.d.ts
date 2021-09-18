import { IEventPublisher } from '.';
export declare class MintService {
    private eventPublisher;
    private assetRepository;
    private portfolioRepository;
    private transactionService;
    constructor(eventPublisher?: IEventPublisher);
    mintUnits(assetId: string, units: number): Promise<void>;
    burnUnits(assetId: string, units: number): Promise<void>;
}
