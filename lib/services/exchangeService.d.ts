/// <reference types="node" />
import { EventEmitter } from 'events';
import { PortfolioRepository, AssetRepository, TransactionRepository, MarketMakerRepository, TExchangeOrderFill, TExchangeOrderFailed, TNewExchangeOrderConfig, ExchangeOrder } from '..';
export declare class ExchangeService {
    private emitter;
    private exchangeOrderRepository;
    private exchangeTradeRepository;
    private exchangeQuoteRepository;
    private portfolioRepository;
    private assetHolderRepository;
    private transactionService;
    private marketMakerService;
    constructor(assetRepository: AssetRepository, portfolioRepository: PortfolioRepository, transactionRepository: TransactionRepository, marketMakerRepository: MarketMakerRepository, emitter?: EventEmitter);
    on(event: string, listener: (...args: any[]) => void): void;
    emitOrderExecution(event: TExchangeOrderFill): void;
    emitOrderFail(event: TExchangeOrderFailed): void;
    processOrder(orderPayload: TNewExchangeOrderConfig): Promise<ExchangeOrder | undefined>;
    private _onTrade;
    private _deliverOrderUpdateStatus;
    private _deliverMakerOrderUpdate;
    private _deliverTakerOrderUpdate;
    private _updateExchangeOrder;
    private _onUpdateQuote;
    private _processTransaction;
    private _verifyAssetsAsync;
    private _verifyFundsAsync;
}
