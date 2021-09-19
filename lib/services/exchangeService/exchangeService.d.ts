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
    buy(userId: string, assetId: string, orderSize: number): Promise<void>;
    sell(userId: string, assetId: string, orderSize: number): Promise<void>;
    user_transact(userId: string, assetId: string, orderSide: string, orderSize: number): Promise<void>;
    portfolio_transact(portfolioId: string, assetId: string, orderSide: string, orderSize: number): Promise<void>;
    handleNewExchangeOrderAsync(orderPayload: TNewExchangeOrder): Promise<ExchangeOrder>;
    private onFill;
    private onTrade;
    private process_transaction;
    private verifyAssetsAsync;
    private verifyFundsAsync;
}
