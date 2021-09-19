import { TNewExchangeOrder, ExchangeOrder, IEventPublisher } from '../..';
export declare class ExchangeService {
    private orderEventPublisher;
    private userRepository;
    private assetRepository;
    private portfolioRepository;
    private assetHolderRepository;
    private exchangeOrderRepository;
    private exchangeTradeRepository;
    private exchangeQuoteRepository;
    private transactionService;
    private makerService;
    constructor(eventPublisher?: IEventPublisher);
    buy(userId: string, assetId: string, units: number): Promise<null | undefined>;
    sell(userId: string, assetId: string, units: number): Promise<null | undefined>;
    transact(userId: string, assetId: string, orderSide: string, orderSize: number): Promise<null | undefined>;
    handleNewExchangeOrderAsync(orderPayload: TNewExchangeOrder): Promise<ExchangeOrder>;
    private onFill;
    private onTrade;
    private xact;
    private verifyAssetsAsync;
    private verifyFundsAsync;
}
