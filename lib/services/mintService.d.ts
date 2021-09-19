import { IEventPublisher } from '.';
import { Principal } from '..';
export declare class MintService {
    private eventPublisher;
    private assetRepository;
    private portfolioRepository;
    private transactionService;
    private me;
    constructor(me: Principal, eventPublisher?: IEventPublisher);
    mintUnits(assetId: string, units: number): Promise<void>;
    burnUnits(assetId: string, units: number): Promise<void>;
}
