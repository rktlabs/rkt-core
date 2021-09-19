import { IEventPublisher } from '..';
export declare class SimpleExchangeService {
    private userRepository;
    private assetRepository;
    private portfolioRepository;
    private assetHolderRepository;
    private exchangeQuoteRepository;
    private transactionService;
    private makerService;
    constructor(eventPublisher?: IEventPublisher);
    buy(userId: string, assetId: string, units: number): Promise<null | undefined>;
    sell(userId: string, assetId: string, units: number): Promise<null | undefined>;
    transact(userId: string, assetId: string, orderSide: string, orderSize: number): Promise<null | undefined>;
    private xact;
    private verifyAssetsAsync;
    private verifyFundsAsync;
}
