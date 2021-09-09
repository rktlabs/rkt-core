import { ExchangeQuoteRepository, ExchangeTradeRepository, ExchangeOrderRepository } from '..';
export declare class ExchangeQuery {
    exchangeQuoteRepository: ExchangeQuoteRepository;
    exchangeTradeRepository: ExchangeTradeRepository;
    exchangeOrderRepository: ExchangeOrderRepository;
    constructor();
    getExchangeTradesAsync(qs?: any): Promise<{
        data: import("..").TExchangeTrade[];
    }>;
    getExchangeTradeDetailAsync(tradeId: string): Promise<{
        data: import("..").TExchangeTrade | null;
    }>;
    getExchangeQuoteAsync(assetId: string): Promise<{
        data: import("..").TExchangeQuote | null;
    }>;
    getExchangeOrdersAsync(qs?: any): Promise<{
        data: import("..").TExchangeOrder[];
    }>;
    getExchangeOrderDetailAsync(exchangeId: string, orderId: string): Promise<{
        data: import("..").TExchangeOrder | null;
    }>;
}
